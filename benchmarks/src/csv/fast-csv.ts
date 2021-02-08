import { createReadStream } from 'fs-extra'
import * as csv from 'fast-csv';
import { AsyncIterable } from 'ix';

export const fastCSV = async (filePath: string) => {
    console.time("fast-csv")
    const result = createReadStream(filePath)
        .pipe(csv.parse({ headers: true }))

    await AsyncIterable.from(result).count()
    console.timeEnd('fast-csv')
}