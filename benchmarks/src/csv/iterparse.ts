import { createReadStream } from 'fs-extra'
import { csvRead, download } from 'iterparse'
import { AsyncIterable } from 'ix';
import { sampleFile } from './root';

export const iterparseCSV = async (filePath: string) => {
    console.time("iterparse")
    const result = csvRead({ filePath })
    await AsyncIterable.from(result).count()

    console.timeEnd("iterparse")
}