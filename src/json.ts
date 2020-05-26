import { delay } from './_internal/helpers';
import { sourceToReadStream, Source, Output, outputToWriteStream, IX, AnyIterable } from './base';
import { OperatorAsyncFunction } from 'ix/interfaces';
const JSONStream = require('JSONStream')

async function* _jsonIterParser(stream: NodeJS.ReadableStream, pattern: string): AsyncIterable<unknown> {
    const parser = JSONStream.parse(pattern)
    stream.pipe(parser)
    let data: unknown[] = []
    let done = false
    parser.on(`data`, (obj: unknown) => {
        data.push(obj)
        if (data.length > 10) {
            stream.pause()
        }
    })
    stream.on('close', () => {
        done = true
    })
    stream.on('end', () => {
        done = true
    })
    stream.on('error', (err) => {
        throw err
    })
    while (!done || data.length > 0) {
        const d = data.shift()
        if (!d) {
            await delay(0)
            stream.resume()
            continue
        }
        yield d
    }
}

async function* _jsonIterWriter<T>(output: () => Promise<NodeJS.WritableStream>, stream: AnyIterable<T>): AsyncIterable<T> {
    let x = 0
    let dest: NodeJS.WritableStream | null = null
    let loaded = false
    for await (const data of stream) {
        if (!loaded) {
            loaded = true
            dest = await output()
        }
        if (x === 0) {
            dest?.write("[\r\n")
            dest?.write(JSON.stringify(data))
            x++
            yield data
            continue
        }
        dest?.write(`\r\n,${JSON.stringify(data)}`)
        yield data
    }
    if (x === 0) {
        dest?.end()
        return
    }
    dest?.write("\r\n]")
    dest?.end()
}

export interface JSONReadOptions {
    /**
     * JSON parsing pattern
     * @example
     * [{...}, {...}] => *
     * { a: [{...}, {...}] } => a.*
     * { a: { b: [{...}, {...}] } } => a.b.*
     */
    pattern: string
}

/**
 * Function will read big JSON files in memory efficent way.
 * @param source - path to file or ReadableStream
 * @param options - parsing pattern {@link JSONReadOptions}
 */
export function jsonRead<T>(source: Source, options: JSONReadOptions): AsyncIterable<T> {
    return IX.from(_jsonIterParser(sourceToReadStream(source), options.pattern))
}

/**
 * Function will write iteratble in memory efficient way. Tested iteratebles that produce 10gb json files 
 * @param out - path to file or WritableStream
 * @param data - any iteratable.
 * @example
 * ```typescript
 * import { AsyncIterable } from 'ix'
 * AsyncIterable.from([1, 2, 3, 4, 5]).pipe(jsonWrite("path/to/file"))
 * ```
 * @example
 * ```typescript
 * jsonWrite("/path/to/file", [{ a: 1, b: 2 }, { a: 1, b: 2 }])
 * ```
 * @example
 * ```typescript
 * jsonWrite(process.stdout, [1, 2, 3, 4, 5, 6, 7, 8])
 * ```
 */
export function jsonWrite<T>(out: Output): OperatorAsyncFunction<T, T>
export function jsonWrite<T>(out: Output, data: AnyIterable<T>): AsyncIterable<T>
export function jsonWrite<T>(out: Output, data?: AnyIterable<T>): OperatorAsyncFunction<T, T> | AsyncIterable<T> {
    if (!data) return (d) => jsonWrite(out, d)
    return IX.from(_jsonIterWriter(outputToWriteStream(out), data))
}