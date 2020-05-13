import { from, AsyncIterableX } from 'ix/asynciterable'
import { Source, Output, sourceToReadStream, outputToWriteStream } from './base'
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
    dynamicTyping?:
    | boolean
    | { [headerName: string]: boolean;[columnNumber: number]: boolean }
    | ((field: string | number) => boolean); // default: false
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
            await delay(0)
            if (done && items.length === 0) {
                return
            }
            if (!done) {
                source.resume()
            }
            continue
        }
        yield d
    }
}

export function csvRead<T>(source: Source, options?: CSVReadOptions): AsyncIterable<T> {
    return from(_csvIterParser(sourceToReadStream(source), options))
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

async function* _csvIterWriter<T extends CSVObject>(data: AsyncIterable<T>, out: NodeJS.WritableStream, options?: CSVWriteOptions) {
    let items: T[] = []
    let chunk = 0
    console.log(out)
    for await (const d of data) {
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
        out.write(`${csv}\r\n`)
    }
    if (items.length !== 0) {
        const csv = Papa.unparse(items, {
            header: chunk === 0,
            ...options
        })
        out.write(csv)
    }

    out.end()
}

export function csvWrite<T extends CSVObject>(out: Output): OperatorAsyncFunction<T, T>
export function csvWrite<T extends CSVObject>(data: AsyncIterableX<T>, out: Output): AsyncIterableX<T>
export function csvWrite<T extends CSVObject>(data: AsyncIterableX<T> | Output, out?: Output): OperatorAsyncFunction<T, T> | AsyncIterableX<T> {
    if (arguments.length === 1) {
        if (!(typeof data === 'string' || data instanceof EventEmitter)) {
            throw new Error("Impossible combination")
        }
        const fn: OperatorAsyncFunction<T, T> = (d) => {
            return from(_csvIterWriter(d, outputToWriteStream(data)))
        }
        return fn
    }
    if (typeof data === 'string' || data instanceof EventEmitter) {
        throw new Error("Impossible combination")
    }
    if (!out) {
        throw new Error("Expected to receive output parameter but got undefined")
    }
    return from(_csvIterWriter(data, outputToWriteStream(out)))
}

from([
    {
        a: 1,
        b: 2,
        c: 3
    },
    {
        a: 1,
        b: 2,
        c: 3
    },
    {
        a: 1,
        b: 2,
        c: 3
    },
    {
        a: 1,
        b: 2,
        c: 3
    }
])
    .pipe(csvWrite('dat.csv')).forEach((c) => {
        console.log(c)
    })
