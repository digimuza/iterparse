import { from } from "ix/asynciterable"
import { Source, Output, sourceToReadStream, outputToWriteStream } from "./base"
import { delay } from "./_internal/helpers"
import { EventEmitter } from "events"
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

export function bufferRead(source: Source): AsyncIterable<Buffer> {
    return from(_bufferIterParser(sourceToReadStream(source)))
}


async function* _bufferIterWriter<T>(output: NodeJS.WritableStream, stream: AsyncIterable<Buffer>): AsyncIterable<Buffer> {
    for await (const data of stream) {
        output.write(data)
        yield data
    }
    output.end()
}

export function bufferWrite(out: Output): OperatorAsyncFunction<Buffer, Buffer>
export function bufferWrite(data: AsyncIterable<Buffer>, out: Output): AsyncIterable<Buffer>
export function bufferWrite(data: AsyncIterable<Buffer> | Output, out?: Output): OperatorAsyncFunction<Buffer, Buffer> | AsyncIterable<Buffer> {
    if (arguments.length === 1) {
        if (!(typeof data === 'string' || data instanceof EventEmitter)) {
            throw new Error("Impossible combination")
        }
        return (d: AsyncIterable<Buffer>) => {
            return from(_bufferIterWriter(outputToWriteStream(data), d))
        }
    }
    if (typeof data === 'string' || data instanceof EventEmitter) {
        throw new Error("Impossible combination")
    }
    if (!out) {
        throw new Error("Expected to receive output parameter but got undefined")
    }
    return from(_bufferIterWriter(outputToWriteStream(out), data))
}