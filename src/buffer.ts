import {AsyncIterable as IX } from "ix"
import { Source, Output, sourceToReadStream, outputToWriteStream, AnyIterable } from "./base"
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
    return IX.from(_bufferIterParser(sourceToReadStream(source)))
}


async function* _bufferIterWriter(output: () => Promise<NodeJS.WritableStream>, stream: AnyIterable<Buffer>): AsyncIterable<Buffer> {
    let dest: NodeJS.WritableStream | null = null
    let loaded = false
    for await (const data of stream) {
        if (!loaded) {
            dest = await output()
            loaded = true
        }
        dest?.write(data)
        yield data
    }
    dest?.end()
}

export function bufferWrite(out: Output): OperatorAsyncFunction<Buffer, Buffer>
export function bufferWrite(data: AnyIterable<Buffer>, out: Output): AsyncIterable<Buffer>
export function bufferWrite(data: AnyIterable<Buffer> | Output, out?: Output): OperatorAsyncFunction<Buffer, Buffer> | AsyncIterable<Buffer> {
    if (arguments.length === 1) {
        if (!(typeof data === 'string' || data instanceof EventEmitter)) {
            throw new Error("Impossible combination")
        }
        return (d: AsyncIterable<Buffer>) => {
            return IX.from(_bufferIterWriter(outputToWriteStream(data), d))
        }
    }
    if (typeof data === 'string' || data instanceof EventEmitter) {
        throw new Error("Impossible combination")
    }
    if (!out) {
        throw new Error("Expected to receive output parameter but got undefined")
    }
    return IX.from(_bufferIterWriter(outputToWriteStream(out), data))
}