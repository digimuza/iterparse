import faker from 'faker'
import { jsonWrite } from 'iterparse'
import { AsyncIterable } from 'ix'
import { range } from 'ix/asynciterable'
import { resolve } from 'path'



export async function jsonTestData() {
    const generatedFile = resolve(__dirname, "./_downloads/generated.json")
    await AsyncIterable.from(range(0, (1000 * 1000))).map((q) => {
        return {
            name: faker.name.firstName(),
            lastName: faker.name.lastName(),
            company: faker.company.companyName(),
            address: faker.address.city()
        }
    })
        .pipe(jsonWrite({
            filePath: generatedFile,
            progress: (q) => console.log(q.toString()) 
        }))
        .count()
    return generatedFile
}