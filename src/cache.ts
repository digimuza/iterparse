import { ensureFile, existsSync, readdirSync, readJSON, rmdirSync, unlinkSync, writeFile } from "fs-extra";
import { AsyncIterable } from "ix";
import { basename, extname, resolve } from "path";
import { purry } from "ts-prime";
import { jsonRead, jsonWrite } from "./json";
import { AnyIterable, IX } from "./types";
import * as P from 'ts-prime'
import { ProgressReportOptions } from "./helpers";

export function onLastItem<T>(fn: () => any) {
    return (q: AnyIterable<T>) => {
        async function* iter() {
            for await (const x of q) {
                yield x
            }
            await fn()
        }

        return iter()
    }
}

export interface CacheIterOptions extends ProgressReportOptions {
    cacheFolder: string,
    enabled?: boolean,
    referenceId?: string,
    /**
     * @defaultValue true
     */
    deleteOnChangedReferenceId?: boolean
    /**
     * @defaultValue true
     */
    deleteOnChangedIteratableId?: boolean
    nice?: { buffer: number },
    logger?: Pick<Console, 'info'>
}
export function _cacheIter<T>(data: AnyIterable<T>, options: CacheIterOptions): IX<T> {
    const { nice, enabled = true } = options
    if (!enabled) {
        options.logger?.info('Cache is disabled. Returning original iterator')
        return IX.from(data)
    }
    return IX.defer(async () => {
        const constructorIteratableId = () => {
            const getIteratableID = (data?: AnyIterable<T>): string => {
                if (data == null) return ''
                const iteratable = data as any
                return `${iteratable?.constructor?.name}:${getIteratableID(iteratable._source)}`
            }
            const iteratableId = P.canFail(() => getIteratableID(data))
            if (P.isError(iteratableId)) {
                return ''
            }
            return P.hash(`${iteratableId}:${JSON.stringify(data)}`)
        }

        const iteratableId = constructorIteratableId()
        const metaFile = resolve(options.cacheFolder, "_meta.json")
        const referenceId = options.referenceId ?? P.hash(new Date().toDateString())
        const lockFile = resolve(options.cacheFolder, ".lock")
        if (existsSync(lockFile)) {
            options.logger?.info('Lock file exist. This usually means that iterator was not cached fully. Cache folder will be deleted and recreated with new iterator')
            rmdirSync(options.cacheFolder, { recursive: true })
        }
        if (!existsSync(metaFile)) {
            options.logger?.info('Meta file does not exists. Deleting cache folder...')
            rmdirSync(options.cacheFolder, { recursive: true })
        }

        if (existsSync(metaFile)) {
            const meta: { referenceId: string, createdAt: string, iteratableId: string, format: CacheIterOptions['nice'] } = await readJSON(metaFile)
            if (meta.referenceId !== referenceId) {
                options.logger?.info('Reference id changed. Deleting cache folder...')
                rmdirSync(options.cacheFolder, { recursive: true })
            }

            if (!P.equals(meta.format, options.nice)) {
                options.logger?.info('Cache format changed. Deleting cache folder...')
                rmdirSync(options.cacheFolder, { recursive: true })
            }

            if (!P.equals(meta.iteratableId, iteratableId)) {
                options.logger?.info('Source iterator structure changed. Deleting cache folder...')
                rmdirSync(options.cacheFolder, { recursive: true })
            }
        }

        const getCache = () => {
            if (existsSync(options.cacheFolder)) {
                const files = readdirSync(options.cacheFolder)
                if (files.length === 0) return
                const cacheFiles = files.filter((path) => extname(path) === '.json' && basename(path).startsWith('cache'))
                options.logger?.info(`Found cache data. Reading ${cacheFiles.length} files...`)
                return IX.from(cacheFiles)
                    .flatMap((filePath) => jsonRead<T>({ filePath: resolve(options.cacheFolder, filePath), pattern: '*', progress: options.progress, progressFrequency: options.progressFrequency }))
            }

            return
        }

        const cache = getCache()
        if (cache) return cache
        if (existsSync(options.cacheFolder)) {
            rmdirSync(options.cacheFolder, { recursive: true })
        }
        await ensureFile(lockFile)

        const onCacheComplete = async () => {
            unlinkSync(lockFile)
            options.logger?.info(`Cache was created successfully...`)
            await writeFile(metaFile, JSON.stringify({ iteratableId, referenceId, createdAt: new Date().toISOString(), format: options.nice }, undefined, '\t'))
        }

        if (nice) {
            await writeFile(lockFile, JSON.stringify({ started: Date.now() }))
            return IX.from(data)
                .buffer(nice.buffer)
                // TODO use trailingMap helper
                .map(async (items, index) => {
                    writeFile(resolve(options.cacheFolder, `cache-${index}.json`), JSON.stringify(items, undefined, '\t'))
                    return items
                })
                .flatMap((e) => AsyncIterable.from(e))
                .pipe(onLastItem(onCacheComplete))
        }
        await writeFile(lockFile, JSON.stringify({ started: Date.now() }))
        return IX.from(data)
            .pipe(jsonWrite({ filePath: resolve(options.cacheFolder, `cache.json`) }))
            .pipe(onLastItem(onCacheComplete))
    })
}

/**
 * Cache iterator output to file.
 * Useful when we need develop complex iterator pipelines.
 * @param options - Check more information in {@link CacheIterOptions}
 * @include ./cache-iter.md
 * @example
 *  import { cacheIter } from 'iterparse'
 * 
 *  getFeed() // If cache exists get feed function will not be called
 *      .pipe(cacheIter({ cacheFolder: "./_cache" }))
 *      .count()
 * 
 * @example
 *  import { cacheIter } from 'iterparse'
 *  
 *  const cachedIter = cacheIter(getFeed(), { cacheFolder: "./_cache" })
 * 
 *  for await (const item of cachedIter) {
 *      console.log(item)
 *  }
 * @category Utility
 */
export function cacheIter<T>(options: CacheIterOptions): (data: AnyIterable<T>) => IX<T>
export function cacheIter<T>(data: AnyIterable<T>, options: CacheIterOptions): IX<T>
export function cacheIter() {
    return purry(_cacheIter, arguments)
}