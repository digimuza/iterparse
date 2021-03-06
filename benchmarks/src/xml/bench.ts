import { createReadStream, existsSync } from "fs-extra"
import { AsyncIterable } from "ix"
import { xmlRead } from "iterparse"
import prettyMs from 'pretty-ms'
import { resolve } from "path";
import { xmlTestData } from "./generate";

const XmlStream = require('xml-stream')
/**
 * http://eforexcel.com/wp/downloads-18-sample-csv-files-data-sets-for-testing-sales/
 */

export const sampleFile = resolve(__dirname, "./_downloads/generated.xml")

const monitorRAM = () => {
    let tick = 0
    let sum = 0
    let interval = setInterval(() => {
        sum += process.memoryUsage().heapUsed
        tick += 1
    }, 1000)

    return () => {
        clearInterval(interval)
        return sum / tick
    }
}
export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

const benchmarks = [
    {
        package: 'iterparse',
        link: "https://github.com/digimuza/iterparse",
        test: async (filePath: string) => {
            const ram = monitorRAM()
            const start = Date.now()
            const result = xmlRead({ filePath, nodeName: "Person" })
            const count = await AsyncIterable.from(result).count()
            return {
                ram: ram(),
                duration: Date.now() - start,
                count
            }
        }
    }
]



async function run() {
    const generatedFile = resolve(__dirname, "./_downloads/generated.xml")
    if (!existsSync(generatedFile)) {
        console.log("Generating test data")
        await xmlTestData()
    }
    const result = await AsyncIterable.from(benchmarks).map(async (q) => {
        const result = await q.test(sampleFile)
        return {
            ...q,
            file: sampleFile,
            ...result,
            ramNice: formatBytes(result.ram)
        }

    }).map((q) => ({ ...q, niceDuration: prettyMs(q.duration) })).toArray()
    console.log(JSON.stringify(result, undefined, '\t'))
}

run()