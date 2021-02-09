import { Progress, ProgressReportOptions, WriteProgress, WriteProgressReportOptions } from './helpers'
import { appendFile, ensureFile, existsSync, open, statSync, unlink, unlinkSync } from 'fs-extra'
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
 * @include ./LineReadOptions.md
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
 * @category Line
 */
export function lineRead(options: LineReadOptions): IX<string> {
    return IX.from(_lineIterParser(options))
}

export interface LineWriteOptions extends FileReference, FileWriteMode, WriteProgressReportOptions { }

function _lineIterWriter(data: AnyIterable<string>, options: LineWriteOptions) {
    async function* iter() {
        let destination: number = 0
        const { mode = 'overwrite' } = options

        if (mode === 'overwrite') {
            if (existsSync(options.filePath)) {
                unlinkSync(options.filePath)
            }
        }
        const progress = new WriteProgress(options.filePath, Date.now())
        const log = () => {
            options.progress?.(progress)
        }
        const inter = setInterval(log, options.progressFrequency || 3000)
        for await (const line of data) {
            if (destination === 0) {
                await ensureFile(options.filePath)
                destination = await open(options.filePath, "a")
            }
            if (!isString(line)) {
                throw new Error(`Incorrect data type. Line type is: "${type(line)}"`)
            }
            const buffer = Buffer.from(`${line}\n`)
            progress.add(buffer.byteLength)
            await appendFile(destination, buffer)
            progress.addItem(1)
            // destination.write(`${line}\n`)
        }

        clearInterval(inter)
        log()
    }

    return IX.from(iter())
}

/**
 * Function will write iteratable in memory efficient way.
 * @include ./LineWriteOptions.md
 * @example
 *  import { AsyncIterable } from 'ix'
 *  import { lineWrite } from 'iterparse'
 *  AsyncIterable.from(["1", "2", "3", "4", "5"])
 *      .pipe(lineWrite({ filePath: "path/to/file" }))
 *      .count()
 * @example
 *  lineWrite(["1", "2", "3", "4", "5"], { filePath: "path/to/file" }).count()
 * @category Line
 */
export function lineWrite(args: LineWriteOptions): (data: AnyIterable<string>) => IX<string>
export function lineWrite(data: AnyIterable<string>, args: LineWriteOptions,): IX<string>
export function lineWrite() {
    return purry(_lineIterWriter, arguments)
}