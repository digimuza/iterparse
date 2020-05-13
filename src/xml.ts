import { Output, Source, sourceToReadStream, outputToWriteStream } from "./base";
import { from } from "ix/asynciterable";
import { delay } from "./_internal/helpers";
import { EventEmitter } from "events";
import { OperatorAsyncFunction } from "ix/interfaces";


// tslint:disable
const xmlStream = require('xml-flow')

/**
 * Parse XML source to iterator
 * @param param0 
 */
export async function* _xmlIterParser<T>({ pattern, source }: {
    pattern: string, source: NodeJS.ReadableStream
}) {
    const parser = xmlStream(source)
    const data: T[] = []
    let done = false

    parser.on(`tag:${pattern}`, (obj: T) => {
        data.push(obj)
        if (data.length > 10) {
            source.pause()
        }
    })
    parser.on('end', () => {
        done = true
    })
    parser.on('close', () => {
        done = true
    })

    source.on('close', () => {
        done = true
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


async function* _xmlWriterParser<T>(data: AsyncIterable<T>, out: NodeJS.WritableStream) {
    let first = 0
    for await (const d of data) {
        if (first === 0) {
            out.write("<root>")
        }
        const x = xmlStream.toXml(d, {
            indent: "\t"
        })
        out.write(`\r\n${x}`)
        first++
    }
    if (first !== 0) {
        out.write("\n</root>\n")
    }
    out.end()
}

export type XMLObject = {
    $name: string,
    $attrs?: Record<string, string | number | boolean>
    $text?: string | number | boolean,
    $markup?: ReadonlyArray<XMLObject | string | number | boolean>

}

export function toXmlNode<T>(nodeFn: (data: T) => XMLObject): (data: T) => XMLObject {
    return (data: T) => {
        return nodeFn(data)
    }
}

export function xmlWrite(out: Output): OperatorAsyncFunction<XMLObject, XMLObject>
export function xmlWrite(data: AsyncIterable<XMLObject>, out: Output): AsyncIterable<XMLObject>
export function xmlWrite(data: AsyncIterable<XMLObject> | Output, out?: Output): OperatorAsyncFunction<XMLObject, XMLObject> | AsyncIterable<XMLObject> {
    if (arguments.length === 1) {
        if (!(typeof data === 'string' || data instanceof EventEmitter)) {
            throw new Error("Impossible combination")
        }
        return (d: AsyncIterable<XMLObject>) => {
            return from(_xmlWriterParser(d, outputToWriteStream(data)))
        }
    }
    if (typeof data === 'string' || data instanceof EventEmitter) {
        throw new Error("Impossible combination")
    }
    if (!out) {
        throw new Error("Expected to receive output parameter but got undefined")
    }
    return from(_xmlWriterParser(data, outputToWriteStream(out)))
}

export function xmlRead(source: Source, options: { pattern: string }): AsyncIterable<XMLObject> {
    return from(_xmlIterParser({
        pattern: options.pattern,
        source: sourceToReadStream(source)
    }))
}