import { createReadStream, createWriteStream } from "fs"

export type Source = string | NodeJS.ReadableStream
export type Output = string | NodeJS.WriteStream


export function sourceToReadStream(data: Source): NodeJS.ReadableStream {
    if (typeof data === 'string') {
        return createReadStream(data)
    }
    return data
}


export function outputToWriteStream(data: Output): NodeJS.WritableStream {
    console.log(data)
    if (typeof data === 'string') {
        return createWriteStream(data)
    }
    return data
}