import { Output, Source, sourceToReadStream, outputToWriteStream, IX, AnyIterable } from "./base";
import { delay } from "./_internal/helpers";
import { OperatorAsyncFunction } from "ix/interfaces";

const xmlStream = require('xml-flow')


export enum XMLParserBehavior {
    ALWAYS = 1,
    SOMETIMES = 0,
    NEVER = -1
}
export interface XMLParserConfig {
    strict?: boolean,
    lowercase?: boolean,
    trim?: boolean,
    preserveMarkup?: XMLParserBehavior,
    useArrays?: XMLParserBehavior,
    cdataAsText?: boolean
}
export const defaultXmlParserConfig = {
    strict: false,
    lowercase: true,
    trim: true,
    preserveMarkup: XMLParserBehavior.SOMETIMES,
    useArrays: XMLParserBehavior.SOMETIMES,
    cdataAsText: false
} as const

async function* _xmlIterParser<T>(args: {
    pattern: string, source: NodeJS.ReadableStream, options?: XMLParserConfig
}) {
    const { pattern, source, options = {} } = args
    const defaultConfig = {
        ...options,
        ...defaultXmlParserConfig
    }
    const parser = xmlStream(source, defaultConfig)
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

/**
 * xmlRead function return object type
 */
export type XMLObject = {
    $name: string,
    $attrs?: XMLAttributes
    $text?: string,
    $markup?: ReadonlyArray<XMLMarkup>
    [d: string]: string | XMLMarkup | XMLAttributes | ReadonlyArray<XMLMarkup> | undefined | Object
}



export interface XMLReadOptions {
    /**
     * XML parsing pattern
     * @example
     * <root>
     *   <item>...</item>
     *   <item>...</item>
     *   <item>...</item>
     *   <item>...</item>
     * </root>
     * Results to `item`
     */
    pattern: string
    options?: XMLParserConfig
}

/**
 * Function will read big JSON files in memory efficent way.
 * @param source - path to file or ReadableStream
 * @param options - parsing pattern {@link XMLReadOptions}
 */
export function xmlRead<T extends XMLObject>(source: Source, options: XMLReadOptions): AsyncIterable<T> {
    return IX.from(_xmlIterParser({
        pattern: options.pattern,
        source: sourceToReadStream(source)
    }))
}

/**
 * @param out - path to file or WritableStream
 * @param data - any iteratable that extends XMLObject type.
 * @example
 * ```typescript
 * import { AsyncIterable } from 'ix'
 * AsyncIterable.from([{ a: 1, b: 2 }, { a: 1, b: 2 }]).map(toXmlNode((item)=>({ $name: "person", ...item }))).pipe(xmlWrite("path/to/file"))
 * ```
 * @example
 * ```typescript
 * xmlWrite("/path/to/file", [{ a: 1, b: 2 }, { a: 1, b: 2 }].map(toXmlNode((item)=>({ $name: "person", ...item })))
 * ```
 * @example
 * ```typescript
 * xmlWrite(process.stdout, [{ a: 1, b: 2 }, { a: 1, b: 2 }].map(toXmlNode((item)=>({ $name: "person", ...item })))
 * ```
 */
export function xmlWrite(out: Output): OperatorAsyncFunction<XMLObject, XMLObject>
export function xmlWrite(out: Output, data: AnyIterable<XMLObject>): AsyncIterable<XMLObject>
export function xmlWrite(out: Output, data?: AnyIterable<XMLObject>): OperatorAsyncFunction<XMLObject, XMLObject> | AsyncIterable<XMLObject> {
    if (!data) return (d) => xmlWrite(out, d);
    return IX.from(_xmlWriterParser(data, outputToWriteStream(out)))
}

/**
 * Sample helper to conver data to XMLObject
 * @param nodeFn - transformation function
 * @example
 * ```typescript
 * const xmlObjects = [{ a: 1, b: 2 }, { a: 1, b: 2 }].map(toXmlNode((item)=>({ $name: "person", ...item })
 * ```
 */
export function toXmlNode<T>(nodeFn: (data: T) => XMLObject): (data: T) => XMLObject {
    return (data: T) => {
        return nodeFn(data)
    }
}