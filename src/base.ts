import { createReadStream, createWriteStream } from "fs"
import { ensureFile } from 'fs-extra'
export type Source = string | NodeJS.ReadableStream
export type Output = string | NodeJS.WriteStream
export { AsyncIterable as IX } from 'ix'

export function sourceToReadStream(data: Source): NodeJS.ReadableStream {
    if (typeof data === 'string') {
        return createReadStream(data)
    }
    return data
}

export function outputToWriteStream(data: Output): () => Promise<NodeJS.WritableStream> {
    if (typeof data === 'string') {
        return async () => {
            await ensureFile(data)
            return createWriteStream(data)
        }
    }
    return async () => {
        return data
    }
}

export type AnyIterable<T> = Iterable<T> | AsyncIterable<T>