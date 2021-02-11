import { readdirSync, readJSON, writeFile, writeJSON } from "fs-extra";
import { csvRead, xmlRead } from "iterparse";
import { extname, resolve } from "path";
import * as P from 'ts-prime'

const filePatterMap: Record<string, string> = {
    "battery.xml": "mesh",
    "catalog.xml": "CD",
    "customer.xml": "T",
    "lineitem.xml": "T",
    "nasa.xml": "dataset"
}


async function compareOut() {
    const sampleFolder = resolve(__dirname, "./samples")
    await Promise.all(
        readdirSync(sampleFolder)
            .filter((q) => extname(q) === ".xml")
            // .filter((q) => 'nasa.xml' == q)
            .map(async (file) => {
                const parsed = await xmlRead({ filePath: resolve(sampleFolder, file), nodeName: filePatterMap[file] }).toArray()
                const validFile = resolve(sampleFolder, file.replace(extname(file), ".json"))
                const valid = await readJSON(validFile)

                if (!P.equals(parsed, valid)) {
                    await writeFile(resolve(sampleFolder, `${file}.__invalid__.json`.replace(extname(file), ".json")), JSON.stringify(parsed, undefined, '\t'))
                    console.log(`Failed to compare files: ${file}: ${validFile}`)
                    process.exit(1)
                }
                console.log("Success", file)

            })
    )
}

compareOut()