import { createWriteStream, ensureFile } from 'fs-extra'

/**
 * Writes source stream to file
 * @param source - NodeJS ReadableStream
 * @param file - destination file
 */
export async function write(source: NodeJS.ReadableStream, file: string): Promise<string> {
    return new Promise(async (resolve)=> {
        await ensureFile(file)
        const dest = createWriteStream(file)
        source.pipe(dest)
        source.on('end', () => {
            resolve()
        })
    })
}