import { fastCSV } from "./fast-csv"
import { iterparseCSV } from "./iterparse"

/**
 * http://eforexcel.com/wp/downloads-18-sample-csv-files-data-sets-for-testing-sales/
 */

export const sampleFile = "./_downloads/5m Sales Records.csv"


const benchmarks = [
    fastCSV,
    iterparseCSV
]

async function run() {
    for (const benchmark of benchmarks) {
        benchmark(sampleFile)
    }
}

run()