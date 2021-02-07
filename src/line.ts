import { Progress, ProgressReportOptions } from './helpers'
import { createWriteStream, ensureFile, statSync } from 'fs-extra'
import { bufferRead } from './buffer'
import { isString, purry, type } from 'ts-prime'
import { AnyIterable, FileReference, FileWriteMode, IX } from './types'
export interface LineReadOptions extends ProgressReportOptions, FileReference {
    lineBreak?: string
}

export async function* _lineIterParser(options: LineReadOptions) {
    const size = statSync(options.filePath)
    const { lineBreak = '\n' } = options || {}
    const progress = new Progress(options.filePath, size.size, Date.now())
    let prev = ""
    for await (const buffer of bufferRead({
        ...options,
        progress: (q) => {
            q.set({
                items: progress.items
            })
            options?.progress?.(q)
        }
    })) {
        const lineList = buffer.toString().split(lineBreak)
        prev = lineList.pop() || ''
        for (const l of lineList) {
            yield l
            progress.addItem(1)
        }
    }
}


/**
 * Function will read file line by line
 * @param options - optional options list.
 * @example
 *  import { lineRead } from 'iterparse'
 *  lineRead({ filePath: "path/to/file" })
 *      .map((q)=> console.log(q))
 *      .count()
 * @example
 *  import { lineRead } from 'iterparse'
 *  for await (const line of lineRead({ filePath: "path/to/file" })) {
 * 
 *  }
 * @category Read, Line
 */
export function lineRead(options: LineReadOptions): IX<string> {
    return IX.from(_lineIterParser(options))
}

export interface LineWriteOptions extends FileReference, FileWriteMode { }

async function* _lineIterWriter(data: AnyIterable<string>, args: LineWriteOptions) {
    let destination: NodeJS.WritableStream = undefined as unknown as NodeJS.WritableStream
    let loaded = false
    const { mode = 'overwrite' } = args
    for await (const line of data) {
        if (!loaded) {
            await ensureFile(args.filePath)
            destination = createWriteStream(args.filePath, { flags: mode === 'append' ? 'a' : 'w' })
        }
        if (!isString(line)) {
            throw new Error(`Incorrect data type. Line type is: "${type(line)}"`)
        }
        destination.write(`${line}\n`)
    }
}

/**
 * Function will write iteratable in memory efficient way.
 * @param out - path to file or WritableStream
 * @param data - iteratable that returns string
 * @example
 *  import { AsyncIterable } from 'ix'
 *  import { lineWrite } from 'iterparse'
 *  AsyncIterable.from(["1", "2", "3", "4", "5"])
 *      .pipe(lineWrite({ filePath: "path/to/file" }))
 *      .count()
 * @example
 *  lineWrite(["1", "2", "3", "4", "5"], { filePath: "path/to/file" }).count()
 * @category Write, Line
 */
export function lineWrite(args: LineWriteOptions): (data: AnyIterable<string>) => IX<string>
export function lineWrite(data: AnyIterable<string>, args: LineWriteOptions,): IX<string>
export function lineWrite() {
    return purry(_lineIterWriter, arguments)
}