import { Output, Source, sourceToReadStream, outputToWriteStream, IX, AnyIterable } from "./base";
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
    const parser = xmlStream(source, {
        strict: true
    })
    const data: T[] = []
    let done = false
    parser.resume()
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


async function* _xmlWriterParser<T>(data: AnyIterable<T>, out: () => Promise<NodeJS.WritableStream>): AsyncIterable<T> {
    let first = 0
    let dest: NodeJS.WritableStream | null = null
    let loaded = false

    for await (const d of data) {
        if (!loaded) {
            loaded = true
            dest = await out()
        }
        if (first === 0) {
            dest?.write("<root>")
        }
        const x = xmlStream.toXml(d, {
            indent: "\t"
        })
        dest?.write(`\r\n${x}`)
        first++
        yield d
    }
    if (first !== 0) {
        dest?.write("\n</root>\n")
    }
    dest?.end()
}

export type XMLAttributes = Record<string, string>
export type XMLMarkup = Object | string
export type XMLObject = {
    $name: string,
    $attrs?: XMLAttributes
    $text?: string,
    $markup?: ReadonlyArray<XMLMarkup>
    [d: string]: string | XMLMarkup | XMLAttributes | ReadonlyArray<XMLMarkup> | undefined | Object
}

export function toXmlNode<T>(nodeFn: (data: T) => XMLObject): (data: T) => XMLObject {
    return (data: T) => {
        return nodeFn(data)
    }
}

export function xmlWrite(out: Output): OperatorAsyncFunction<XMLObject, XMLObject>
export function xmlWrite(data: AnyIterable<XMLObject>, out: Output): AsyncIterable<XMLObject>
export function xmlWrite(data: AnyIterable<XMLObject> | Output, out?: Output): OperatorAsyncFunction<XMLObject, XMLObject> | AsyncIterable<XMLObject> {
    if (arguments.length === 1) {
        if (!(typeof data === 'string' || data instanceof EventEmitter)) {
            throw new Error("Impossible combination")
        }
        return (d: AsyncIterable<XMLObject>) => {
            return IX.from(_xmlWriterParser(d, outputToWriteStream(data)))
        }
    }
    if (typeof data === 'string' || data instanceof EventEmitter) {
        throw new Error("Impossible combination")
    }
    if (!out) {
        throw new Error("Expected to receive output parameter but got undefined")
    }
    return IX.from(_xmlWriterParser(data, outputToWriteStream(out)))
}

export interface XMLReadOptions {
    pattern: string
}

export function xmlRead<T extends XMLObject>(source: Source, options: XMLReadOptions): AsyncIterable<T> {
    return IX.from(_xmlIterParser({
        pattern: options.pattern,
        source: sourceToReadStream(source)
    }))
}