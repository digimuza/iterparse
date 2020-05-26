import { AsyncIterable as IX } from "ix"
import { Source, Output, sourceToReadStream, outputToWriteStream, AnyIterable } from "./base"
import { delay } from "./_internal/helpers"
import { OperatorAsyncFunction } from "ix/interfaces"

async function* _bufferIterParser(source: NodeJS.ReadableStream) {
    let data: Buffer[] = []
    let done = false

    source.on('close', () => {
        done = true
    })
    source.on('data', (value) => {
        data.push(value)
    })
    source.on('end', () => {
        done = true
    })
    source.on('error', (err) => {
        throw err
    })
    while (!done || data.length > 0) {
        const d = data.shift()
        if (!d) {
            await delay(0)
            source.resume()
            continue
        }
        yield d
    }
}

async function* _bufferIterWriter(output: () => Promise<NodeJS.WritableStream>, stream: AnyIterable<Buffer | string>): AsyncIterable<Buffer> {
    let dest: NodeJS.WritableStream | null = null
    let loaded = false
    for await (const data of stream) {
        if (!loaded) {
            dest = await output()
            loaded = true
        }
        dest?.write(data)
        yield Buffer.from(data)
    }
    dest?.end()
}

/**
 * Function will read big files in memory efficient way. 
 * @param source - path to file or ReadbaleStream
 */
export function bufferRead(source: Source): AsyncIterable<Buffer> {
    return IX.from(_bufferIterParser(sourceToReadStream(source)))
}

/**
 * Function will write buffer to file
 * @param out - path to file or WritableStream
 * @param data - any iteratable that extends string | Buffer types.
 * @example
 * ```typescript
 * import { AsyncIterable } from 'ix'
 * AsyncIterable.from(["one", "two", "three"]).pipe(bufferWrite("path/to/file"))
 * ```
 */
export function bufferWrite(out: Output): OperatorAsyncFunction<Buffer | string, Buffer>
export function bufferWrite(out: Output, data: AnyIterable<Buffer | string>): AsyncIterable<Buffer>
export function bufferWrite(out: Output, data?: AnyIterable<Buffer | string>): OperatorAsyncFunction<Buffer, Buffer> | AsyncIterable<Buffer> {
    if (!data) return (d) => bufferWrite(out, d);
    return IX.from(_bufferIterWriter(outputToWriteStream(out), data))
}