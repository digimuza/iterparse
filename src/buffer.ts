import { createReadStream, createWriteStream, ensureFile, statSync } from "fs-extra"
import { Progress, ProgressReportOptions } from "./helpers"
import * as P from 'ts-prime'
import { AnyIterable, FileReference, IX } from "./types"
import { purry } from "ts-prime"


export interface BufferReadOptions extends FileReference, ProgressReportOptions {}

async function* _bufferIterParser(options: BufferReadOptions): AsyncGenerator<Buffer, void, unknown> {
    const { progressFrequency = 3000 } = options || {}

    const size = statSync(options.filePath)
    const progress = new Progress(options.filePath, size.size, Date.now())
    const log = () => {
        options?.progress?.(progress)
    }
    const logTh = P.throttle(log, progressFrequency)
    for await (const buffer of createReadStream(options.filePath)) {
        const b = buffer as Buffer
        yield b
        progress.addItem(1)
        progress.add(b.byteLength)
        logTh()
    }
    log()
}

function _bufferWrite(data: AnyIterable<Buffer | string>, options: BufferWriteOptions) {
    async function* iter() {
        let dest: NodeJS.WritableStream | null = null
        const mode = options.mode || 'overwrite'
        let loaded = false
        for await (const item of data) {
            if (!loaded) {
                await ensureFile(options.filePath)
                dest = createWriteStream(options.filePath, { flags: mode === 'append' ? 'a' : "w" })
                loaded = true
            }
            dest?.write(item)
            yield Buffer.from(item)
        }
        dest?.end()
    }

    return IX.from(iter())
}

/**
 * Function will read big files in memory efficient way. 
 * @param options.filePath - Path to file
 * @example
 *  import { bufferRead } from 'iterparse'
 * 
 *  bufferRead({ filePath: "path/to/file" })
 *      .map((buffer)=> console.log(buffer.byteLength))
 *      .count()
 * @example 
 *  import { bufferRead } from 'iterparse'
 * 
 *  for await (const buffer of bufferRead({ filePath: "path/to/file" })) {
 *      console.log(q.byteLength)
 *  }
 * @category Read, Buffer
 */
export function bufferRead(options: BufferReadOptions): IX<Buffer> {
    return IX.from(_bufferIterParser(options))
}


export interface BufferWriteOptions extends FileReference {
    mode?: 'overwrite' | 'append'
}

/**
 * Function will write buffer to file
 * @param data - Any iteratable that extends `AnyIteratable<string | Buffer>` type.
 * @example
 *  import { AsyncIterable } from 'ix'
 *  import { bufferWrite } from 'iterparse'
 *  AsyncIterable.from(["one", "two", "three"]).pipe(bufferWrite({ filePath: "path/to/file" }))
 * @example
 *  import { AsyncIterable } from 'ix'
 *  import { bufferWrite } from 'iterparse'
 *  bufferWrite(getBufferIter() ,{ filePath: "path/to/file" }).count()
 */
export function bufferWrite(options: BufferWriteOptions): (data: AnyIterable<Buffer | string>) => IX<Buffer>
export function bufferWrite(data: AnyIterable<Buffer | string>, options: BufferWriteOptions): IX<Buffer>
export function bufferWrite() {
    return purry(_bufferWrite, arguments)
}
