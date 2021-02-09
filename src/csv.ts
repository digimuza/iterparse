import * as Papa from 'papaparse'
import { statSync, createReadStream, createWriteStream, open, appendFile, existsSync, unlinkSync, ensureFile } from 'fs-extra'
import * as P from 'ts-prime'
import { Progress, ProgressReportOptions, WriteProgress, WriteProgressReportOptions } from './helpers'
import { AsyncIterable } from 'ix'
import { delay, isArray, isObject, mapRecord, purry } from 'ts-prime'
import { GuessableDelimiters } from 'papaparse'
import { AnyIterable, FileReference, FileWriteMode, IX } from './types'

export interface ParsingResult<T> {
    data: T
    errors: Papa.ParseError[]
    meta: Papa.ParseMeta
}
export interface CSVReadOptions extends ProgressReportOptions, FileReference {
    /**
     * The delimiting character. Leave blank to auto-detect from a list of most common delimiters, or any values passed in through delimitersToGuess. 
     * * It can be a string or a function. If string, it must be one of length 1. 
     * * If a function, it must accept the input as first parameter and it must return a string which will be used as delimiter. 
     * * In both cases it cannot be found in Papa.BAD_DELIMITERS.
     * 
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     */
    delimiter?: string; // default: ","

    /**
     * The newline sequence. Leave blank to auto-detect. Must be one of \r, \n, or \r\n.
     * 
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue  `"\r\n"`
     */
    newline?: string;
    /**
     * The character used to quote fields. The quoting of all fields is not mandatory. Any field which is not quoted will correctly read.
     * 
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `"`
     */
    quoteChar?: string;
    /**
     * The character used to escape the quote character within a field. If not set, this option will default to the value of quoteChar, meaning that the default escaping of quote character within a quoted field is using the quote character two times. (e.g. "column with ""quotes"" in text")
     * 
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * 
     * @defaultValue `"`
     */
    escapeChar?: string;
    /**
     * If true, the first row of parsed data will be interpreted as field names. 
     * An array of field names will be returned in meta, and each row of data will be an object of values keyed by field name instead of a simple array. 
     * Rows with a different number of fields from the header row will produce an error. 
     * 
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * 
     * @warning
     * Duplicate field names will overwrite values in previous fields having the same name.
     * @defaultValue `true`
     */
    header?: boolean;
    /**
     * Trims white space from header values.
     * Requires that `options.header === true`
     * 
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * 
     * @defaultValue `true`
     */
    trimHeaders?: boolean;
    /**
     * If true, numeric and boolean data will be converted to their type instead of remaining strings. 
     * Numeric data must conform to the definition of a decimal literal. 
     * Numerical values greater than 2^53 or less than -2^53 will not be converted to numbers to preserve precision. 
     * European-formatted numbers must have commas and dots swapped. 
     * If also accepts an object or a function. If object it's values should be a boolean to indicate if dynamic typing should be applied for each column number (or header name if using headers). 
     * If it's a function, it should return a boolean value for each field number (or name if using headers) which will be passed as first argument.
     * 
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * 
     * @warning 
     * This option will reduce parsing performance
     * 
     * @defaultValue `false`
     */
    dynamicTyping?:
    | boolean
    | { [headerName: string]: boolean;[columnNumber: number]: boolean }
    | ((field: string | number) => boolean); // default: false
    /**
     * The encoding to use when opening local files. If specified, it must be a value supported by the FileReader API.
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `utf8`
     */
    encoding?: string;
    /**
     * A string that indicates a comment (for example, "#" or "//"). When Papa encounters a line starting with this string, it will skip the line.
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `false`
     */
    comments?: boolean | string;
    /**
     * If true, lines that are completely empty (those which evaluate to an empty string) will be skipped. If set to 'greedy', lines that don't have any content (those which have only whitespace after parsing) will also be skipped.
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `true`
     */
    skipEmptyLines?: boolean | 'greedy';
    /**
     * Fast mode speeds up parsing significantly for large inputs. However, it only works when the input has no quoted fields. Fast mode will automatically be enabled if no " characters appear in the input. You can force fast mode either way by setting it to true or false.
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `undefined`
     */
    fastMode?: boolean; // default: undefined
    /**
     * An array of delimiters to guess from if the delimiter option is not set.
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `[',', '\t', '|', ';']`
     */
    delimitersToGuess?: GuessableDelimiters[];
}

/**
 * Read CSV file. In memory efficient way.
 * @include ./CSVReadOptions.md
 * @example
 *  import { csvRead } from 'iterparse'
 *  csvRead({ filePath: 'path/to/file' })
 *      .map((q)=> console.log(q))
 *      .count()
 * 
 * @example
 *  import { csvRead } from 'iterparse'
 *  for await (const item of csvRead({ filePath: 'path/to/file' })) {
 *      console.log(item)
 *  }
 * @category CSV
 */
export function csvRead<T>(options: CSVReadOptions): AsyncIterable<ParsingResult<T>> {
    const { progressFrequency = 3000 } = options || {}
    async function* iter() {
        const fileStats = statSync(options.filePath)
        const progress = new Progress(options.filePath, fileStats.size, Date.now())
        const log = () => {
            options?.progress?.(progress)
        }
        const logTh = P.throttle(log, progressFrequency)
        let obj: Papa.ParseResult[] = []
        let done = false
        const source = createReadStream(options.filePath)
        source.on('data', (q) => {
            if (q instanceof Buffer) {
                progress.add(q.byteLength)
                return
            }
            progress.add(Buffer.from(q).byteLength)

        })
        Papa.parse(
            source,
            {
                ...options,
                header: true,
                step: function (row) {
                    obj.push(row)
                    if (obj.length === 100) {
                        source.pause()
                    }
                },
                complete: function () {
                    done = true
                }
            }
        )
        while (!done || obj.length !== 0) {
            logTh()
            const item = obj.shift()
            if (item == null) {
                source.resume()
                await delay(0)
                continue
            }

            yield item
            progress.addItem()
        }
        log()
    }

    return IX.from(iter())
}




async function* _csvWrite<T extends { [k: string]: unknown }>(data: AnyIterable<T>, options: CSVWriteOptions) {
    let chunk = 0
    let dest: number = 0

    if (options.mode === 'overwrite' && existsSync(options.filePath)) {
        unlinkSync(options.filePath)
    }

    const progress = new WriteProgress(options.filePath, Date.now())
    const log = () => {
        options.progress?.(progress)
    }
    const inter = setInterval(log, options.progressFrequency || 3000)

    for await (const items of IX.from(data).buffer(1000)) {
        if (dest === 0) {
            await ensureFile(options.filePath)
            // Accessing stream only when receiving first item.
            // This is convenient because. If stream have 0 items I will not create any file
            dest = await open(options.filePath, 'a')
        }
        const normalized = items.map((q) => {
            return mapRecord(q as Record<string, string>, ([k, v]) => {
                if (isArray(v) || isObject(v)) {
                    return [k, JSON.stringify(v) as any]
                }

                return [k, v as any]

            }) as Record<string, string | number | boolean | undefined | null>
        })
        const csv = Papa.unparse(normalized, {
            header: chunk === 0,
            ...options
        })
        const buffer = Buffer.from(`${csv}\r\n`)
        await appendFile(dest, buffer)
        progress.add(buffer.byteLength)
        for (const iv of items) {
            yield iv
        }
        progress.addItem(items.length)
        chunk++
    }
    clearInterval(inter)
    log()
}

export interface CSVWriteOptions extends FileReference, FileWriteMode, WriteProgressReportOptions {
    /**
     * @defaultValue `false`
     */
    quotes?: boolean | boolean[];
    /**
     * @defaultValue `"`
     */
    quoteChar?: string; // default: '"'
    /**
    * @defaultValue `"`
    */
    escapeChar?: string; // default: '"'
    /**
    * @defaultValue `,`
    */
    delimiter?: string; // default: ","
    /**
     * @defaultValue `\r\n`
     */
    newline?: string; // default: "\r\n"
    /**
     * @defaultValue `false`
     */
    skipEmptyLines?: boolean | 'greedy'; // default: false
    columns?: string[]; // default: null
}

/**
 * Writes json objects to file in ".csv" format
 * @param data - Any iteratable.
 * @param options - Write options
 * @include ./CSVOptions.md
 * @signature
 *  cswWrite(option)(iteratable)
 * @signature
 *  cswWrite(iteratable,option)
 * @example
 *  import { csvWrite } from 'iterparse'
 *  AsyncIterable.from([{...},{...},{...}])
 *      .pipe(csvWrite({ filePath: "path/to/file" }))
 *      .count()
 * @example
 *  import { csvWrite } from 'iterparse'
 *  csvWrite([{ a: 1, b: 2 },{ a: 1, b: 2 }], { filePath: "/path/to/file" })
 *      .count()
 * @category CSV
 */
export function csvWrite<T extends { [k: string]: unknown }>(options: CSVWriteOptions): (data: AnyIterable<T>) => IX<T>
export function csvWrite<T extends { [k: string]: unknown }>(data: AnyIterable<T>, out: CSVWriteOptions): IX<T>
export function csvWrite() {
    return purry(_csvWrite, arguments)
}
