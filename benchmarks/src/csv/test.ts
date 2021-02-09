import { readdirSync, readJSON, writeFile, writeJSON } from "fs-extra";
import { csvRead } from "iterparse";
import { extname, resolve } from "path";
import * as P from 'ts-prime'
async function compareOut() {
    const sampleFolder = resolve(__dirname, "./samples")
    await Promise.all(
        readdirSync(sampleFolder)
            .filter((q) => extname(q) === ".csv")
            .map(async (file) => {
                const parsed = await csvRead({ filePath: resolve(sampleFolder, file) }).map((q) => q.data).toArray()
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