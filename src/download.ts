import { createWriteStream, ensureFile, existsSync, unlinkSync, writeFile } from 'fs-extra'
import { Stream } from 'stream'
import fetch, { Headers, RequestInit } from 'node-fetch'
import * as P from 'ts-prime'
import { basename, extname, resolve } from 'path'
import { URL } from 'url'
import { DownloadProgress, getFileType } from './helpers'
import { IX } from './types'
import { canFail } from 'ts-prime'

/**
 * Writes source stream to file
 * @param source - NodeJS ReadableStream
 * @param file - destination file
 * @category Utility
 */
async function write(source: NodeJS.ReadableStream | Stream | NodeJS.ReadStream, file: string): Promise<string> {
    return new Promise<string>(async (resolve) => {
        const dest = createWriteStream(file)
        source.pipe(dest)
        source.on('close', () => {
            resolve(file)
        })
        source.on('end', () => {
            resolve(file)
        })
    }).catch((err) => {
        console.log(err)
        throw err
    })
}


export type ResourceIDHookFunction = ((url: string, headers: Headers) => string)
export interface DownloadOptions extends RequestInit {
    url: string
    /**
     * Folder where file will be downloaded
     */
    downloadFolder: string,
    /**
     * Hook for tracking download progress
     * @example
     *      (progress) => console.log(progress.toString())
     */
    progress?: (progress: DownloadProgress) => void,
    /**
     * How often notify about progress?
     * @defaultValue `3000ms`
     */
    progressFrequency?: number

    /**
     * Resource ID generation logic.
     * Basically we can take some data from response and convert to resource ID
     * Examples
     * * etag - from response headers
     * * last-modified - from response headers
     * 
     * If file with same generated resource ID is found file will not be downloaded.
     */
    resourceId?: string | ResourceIDHookFunction | false
}

const defaultResourceIDHookFunction: ResourceIDHookFunction = (_url, headers) => {
    const date = new Date()
    return headers.get('etag') || headers.get('last-modified') || `${date.toDateString()}:${date.getHours()}`
}


/**
 * Function will download any resource from interned and cache it in local file system.
 * 
 * @param url URL to file
 * @include ./DownloadOptions.md
 * @example
 *      import { download } from 'iterparse'
 *      download({ url: "url/to/resource.csv", downloadFolder: "/tmp", progress: (q) => console.log(q.toString())   })
 *          .flatMap((filePath)=> csvRead({ filePath }))
 *          .map((q)=> console.log(q))
 *          .count()
 * 
 * @category Utility
 */
export function download(options: DownloadOptions): IX<string> {
    const { url } = options
    return IX.defer(async () => {
        const response = await fetch(url, options)
        response.body.pause()
        if (!response.ok) {
            response.body.resume()
            const payload = await IX.from(response.body).toArray()
            const json = P.canFail(() => JSON.parse(payload.map((q) => q.toString()).join("")))
            if (!P.isError(json)) {
                throw new Error(`Code: ${response.status}, Body: ${JSON.stringify(json)}`)
            }
            throw new Error(`Code: ${response.status}, Status Text: ${response.statusText}`)
        }
        const { resourceId = defaultResourceIDHookFunction } = options
        const resource = P.isString(resourceId) || P.isBoolean(resourceId) ? resourceId : resourceId(url, response.headers)
        const baseName = basename(new URL(url).pathname)
        const extension = getFileType(response.headers.get('content-type') || '') || extname(baseName)
        const fileName = resource === false ? `${baseName.replace(extname(baseName), '')}-${P.hash(`${url}`)}${extension}` : `${baseName.replace(extname(baseName), '')}-${P.hash(`${url}:${resource}`)}${extension}`
        const filePath = resolve(options.downloadFolder, fileName)
        const lockFilePath = resolve(options.downloadFolder, `.${basename(filePath).replace(extension, '')}.lock`)

        if (existsSync(lockFilePath)) {
            if (existsSync(filePath)) {
                unlinkSync(filePath)
            }
        }

        if (existsSync(filePath)) {
            return IX.of(filePath)
        }
        const meta = { downloaded: Date.now(), status: 'downloading' }
        await ensureFile(lockFilePath)
        await writeFile(lockFilePath, JSON.stringify(meta))
        const downloadProgress = new DownloadProgress(url, Date.now(), P.toInt(response.headers.get('content-length')))
        await ensureFile(filePath)
        const log = () => {
            options.progress?.(downloadProgress)
        }
        const logTh = P.throttle(log, options.progressFrequency || 3000)
        response.body.resume()
        response.body.on('data', (chunk) => {
            if (chunk instanceof Buffer) {
                downloadProgress.add(chunk.byteLength)
            }
            logTh()
        })
        const output = await write(response.body, filePath).then(async (q) => {
            log()
            unlinkSync(lockFilePath)
            return q
        })

        return IX.of(output)
    })
}