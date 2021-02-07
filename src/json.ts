import { createReadStream, createWriteStream, ensureFile, statSync } from 'fs-extra';
import { Progress, ProgressReportOptions } from './helpers';
import * as P from 'ts-prime';
import { purry } from 'ts-prime';
import { AnyIterable, FileReference, FileWriteMode, IX } from './types';
const JSONStream = require('JSONStream')

async function* _jsonIterParser(options: JSONReadOptions) {
    const pStream = createReadStream(options.filePath)
    const size = statSync(options.filePath)
    const progress = new Progress(options.filePath, size.size, Date.now())
    const log = () => {
        options.progress?.(progress)
    }
    const logTh = P.throttle(log, options.progressFrequency || 3000)
    pStream.on('data', (q) => {
        if (q instanceof Buffer) {
            progress.add(q.byteLength)
            return
        }
        progress.add(Buffer.from(q).byteLength)

    })

    const parser = JSONStream.parse(options.pattern)
    pStream.pipe(parser)
    let data: unknown[] = []
    let done = false
    parser.on(`data`, (obj: unknown) => {
        data.push(obj)
        if (data.length > 10) {
            pStream.pause()
        }
    })
    pStream.on('close', () => {
        done = true
    })
    pStream.on('end', () => {
        done = true
    })
    pStream.on('error', (err) => {
        throw err
    })
    while (!done || data.length > 0) {
        logTh()
        const d = data.shift()
        if (!d) {
            await P.delay(0)
            pStream.resume()
            continue
        }
        yield d
        progress.addItem(1)
    }

    log()
}


export interface JSONWriteOptions extends FileReference, FileWriteMode { }

function _jsonWrite<T>(data: AnyIterable<T>, args: JSONWriteOptions): AsyncIterable<T> {
    let dest: NodeJS.WritableStream | null = null
    async function* iter() {
        const { mode = 'overwrite' } = args
        let x = 0
        let loaded = false
        for await (const item of data) {
            if (!loaded) {
                loaded = true
                await ensureFile(args.filePath)
                dest = createWriteStream(args.filePath, { flags: mode === 'append' ? 'a' : 'w' })
                dest?.write(`[\r\n`)
            }
            dest?.write(`${JSON.stringify(item)},\r\n`)
            yield item
        }

    }
    return IX.from(iter()).finally(() => {
        dest?.write("\r\n]")
        dest?.end()
    })
}

export interface JSONReadOptions extends ProgressReportOptions, FileReference {
    /**
     * JSON parsing pattern
     * @example
     *      [{...}, {...}] => *
     *      { a: [{...}, {...}] } => a.*
     *      { a: { b: [{...}, {...}] } } => a.b.*
     */
    pattern: string
}

/**
 * Function will read big JSON files in memory efficient way.
 * @param options - More information {@link JSONReadOptions}
 * @example 
 *  import { jsonRead } from 'iterparse'
 *  jsonRead({ filePath: "path/to/file.json" })
 *      .map((q)=> console.log(q))
 *      .count()
 * @example 
 *  import { jsonRead } from 'iterparse'
 *  for await (const item of jsonRead({ filePath: "path/to/file.json" })) {
 *      console.log(item)
 *  }
 * @category Read, JSON
 */
export function jsonRead<T>(options: JSONReadOptions): IX<T> {
    return IX.from(_jsonIterParser(options))
}

/**
 * Function will write iteratable in memory efficient way. Tested iteratable that produce 10gb json files 
 * @param data - any iteratable.
 * @param options - {@link JSONWriteOptions}
 * @example
 *  import { AsyncIterable } from 'ix'
 *  import { jsonWrite } from 'iterparse'
 *  AsyncIterable.from([1, 2, 3, 4, 5])
 *      .pipe(jsonWrite({ filePath: "path/to/file.json" }))
 *      .count()
 * @example
 *  import { jsonWrite } from 'iterparse'
 *  jsonWrite([{ a: 1, b: 2 }, { a: 1, b: 2 }], { filePath: "/path/to/file" })
 *      .count()
 * @category Write, JSON
 */
export function jsonWrite<T>(options: JSONWriteOptions): (data: AsyncIterable<T>) => AsyncIterable<T>
export function jsonWrite<T>(data: AnyIterable<T>, options: JSONWriteOptions): IX<T>
export function jsonWrite() {
    return purry(_jsonWrite, arguments)
}

