import faker from 'faker'
import { csvWrite } from 'iterparse'
import { AsyncIterable } from 'ix'
import { range } from 'ix/asynciterable'
import { resolve } from 'path'
export async function csvTestData() {
    const generatedFile = resolve(__dirname, "./_downloads/generated.csv")
    await AsyncIterable.from(range(0, (1000 * 1000))).map((q) => {
        return {
            name: faker.name.firstName(),
            lastName: faker.name.lastName(),
            company: faker.company.companyName(),
            address: faker.address.city()
        }
    })
        .pipe(csvWrite({
            filePath: generatedFile,
        }))
        .count()
    return generatedFile
}