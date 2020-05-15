import { delay } from './_internal/helpers';
import { sourceToReadStream, Source, Output, outputToWriteStream, IX, AnyIterable } from './base';
import { EventEmitter } from 'events';
import { OperatorAsyncFunction } from 'ix/interfaces';
const JSONStream = require('JSONStream')
export interface JSONReadOptions {
    pattern: string
}

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



export function jsonRead<T>(source: Source, options: JSONReadOptions): AsyncIterable<T> {
    return IX.from(_jsonIterParser(sourceToReadStream(source), options.pattern))
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


export function jsonWrite<T>(out: Output): OperatorAsyncFunction<T, T>
export function jsonWrite<T>(data: AnyIterable<T>, out: Output): AsyncIterable<T>
export function jsonWrite<T>(data: AnyIterable<T> | Output, out?: Output): OperatorAsyncFunction<T, T> | AsyncIterable<T> {
    if (arguments.length === 1) {
        if (!(typeof data === 'string' || data instanceof EventEmitter)) {
            throw new Error("Impossible combination")
        }
        return (d: AsyncIterable<T>) => {
            return IX.from(_jsonIterWriter(outputToWriteStream(data), d))
        }
    }
    if (typeof data === 'string' || data instanceof EventEmitter) {
        throw new Error("Impossible combination")
    }
    if (!out) {
        throw new Error("Expected to receive output parameter but got undefined")
    }
    return IX.from(_jsonIterWriter(outputToWriteStream(out), data))
}