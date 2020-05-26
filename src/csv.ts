import { Source, Output, sourceToReadStream, outputToWriteStream, IX, AnyIterable } from './base'
import * as Papa from 'papaparse'
import { delay } from './_internal/helpers'
import { EventEmitter } from 'events'
import { OperatorAsyncFunction } from 'ix/interfaces'

export interface CSVReadOptions {
    delimiter?: string; // default: ","
    newline?: string; // default: "\r\n"
    quoteChar?: string; // default: '"'
    escapeChar?: string; // default: '"'
    header?: boolean; // default: false
    trimHeaders?: boolean; // default: false
    encoding?: string; // default: ""
    comments?: boolean | string; // default: false
    skipEmptyLines?: boolean | 'greedy'; // default: false
    fastMode?: boolean; // default: undefined
    delimitersToGuess?: Papa.GuessableDelimiters[]; // default: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
}

async function* _csvIterParser(source: NodeJS.ReadableStream, options?: CSVReadOptions) {
    let items: unknown[] = []
    let done = false
    Papa.parse(sourceToReadStream(source), {
        header: true,
        step: (result) => {
            // Collecting 10 items and pausing stream until items are 
            if (items.length === 10) {
                source.pause()
            }
            if (Array.isArray(result.data)) {
                items.push(...result.data)
            } else {
                items.push(result.data)
            }

        },
        complete: () => {
            done = true
        },
        ...options
    })
    while (!done || items.length >= 0) {
        const d = items.shift()
        if (!d) {
            await delay(1) // Delay until we have new items or proccesing is finished
            if (done && items.length === 0) return;
            if (!done) {
                source.resume()
            }
            continue
        }
        yield d
    }
}


export type CSVObject = Record<string, string | number | boolean | undefined | null>
export interface CSVWriteOptions {
    quotes?: boolean | boolean[]; // default: false
    quoteChar?: string; // default: '"'
    escapeChar?: string; // default: '"'
    delimiter?: string; // default: ","
    header?: boolean; // default: true
    newline?: string; // default: "\r\n"
    skipEmptyLines?: boolean | 'greedy'; // default: false
    columns?: string[]; // default: null
}

async function* _csvIterWriter<T extends CSVObject>(data: AnyIterable<T>, out: () => Promise<NodeJS.WritableStream>, options?: CSVWriteOptions) {
    let items: T[] = []
    let chunk = 0
    let dest: NodeJS.WritableStream | null = null
    let loaded = false
    for await (const d of data) {
        if (!loaded) {
            loaded = true
            // Accessing stream only when receiving first item.
            // This is convienent becouse. If stream have 0 items I will not create any file
            dest = await out()
        }
        yield d
        if (items.length < 10) {
            items.push(d)
        }
        const csv = Papa.unparse(items, {
            header: chunk === 0,
            ...options
        })
        items = []
        chunk++
        dest?.write(`${csv}\r\n`)
    }
    if (items.length !== 0) {
        const csv = Papa.unparse(items, {
            header: chunk === 0,
            ...options
        })
        dest?.write(csv)
    }

    dest?.end()
}


export function csvRead<T>(source: Source, options?: CSVReadOptions): AsyncIterable<T> {
    return IX.from(_csvIterParser(sourceToReadStream(source), options))
}

/**
 * @param out - path to file or ReadableStream
 * @param data - any iteratable.
 * @example
 * ```typescript
 * AsyncIterableX.from([1,2,3,4,5]).pipe(csvWrite("path/to/file"))
 * ```
 * @example
 * csvWrite("/path/to/file", [{ a: 1, b: 2 },{ a: 1, b: 2 }])
 */
export function csvWrite<T extends CSVObject>(out: Output): OperatorAsyncFunction<T, T>
export function csvWrite<T extends CSVObject>(out: Output, data: AnyIterable<T>): AsyncIterable<T>
export function csvWrite<T extends CSVObject>(out: Output, data?: AnyIterable<T>): OperatorAsyncFunction<T, T> | AsyncIterable<T> {
    if (!data) return (d) => csvWrite(out, d);
    return IX.from(_csvIterWriter(data, outputToWriteStream(out)))
}