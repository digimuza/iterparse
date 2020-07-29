import { delay } from './_internal/helpers'
import { IX, Source, sourceToReadStream } from './base'

export async function* _lineIterParser(source: NodeJS.ReadableStream) {
    const lines = [] as string[]
    let prev = ""
    let done = false
    source.on('data', (chunk: Buffer) => {
        const chunks = (prev + chunk.toString()).split("\n")
        prev = chunks.pop() || ''
        lines.push(...chunks)
        if (lines.length === 10) {
            source.pause()
        }
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

    while (!done || lines.length !== 0) {
        await delay(0)
        const line = lines.shift()
        if (line == null) {
            await delay(0)
            source.resume()
            continue
        }
        yield line
    }
}

export function lineRead(source: Source): AsyncIterable<string> {
    return IX.from(_lineIterParser(sourceToReadStream(source)))
}