import { createReadStream, createWriteStream } from "fs"
import { ensureFileSync } from 'fs-extra'
export type Source = string | NodeJS.ReadableStream
export type Output = string | NodeJS.WriteStream


export function sourceToReadStream(data: Source): NodeJS.ReadableStream {
    if (typeof data === 'string') {
        return createReadStream(data)
    }
    return data
}


export function outputToWriteStream(data: Output): NodeJS.WritableStream {
    if (typeof data === 'string') {
        ensureFileSync(data)
        return createWriteStream(data)
    }
    return data
}