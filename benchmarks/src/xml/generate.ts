import faker from 'faker'
import { xmlWrite } from 'iterparse'
import { AsyncIterable } from 'ix'
import { range } from 'ix/asynciterable'
import { resolve } from 'path'



export async function xmlTestData() {
    const generatedFile = resolve(__dirname, "./_downloads/generated.xml")
    await AsyncIterable.from(range(0, (1000 * 1000))).map((q) => {
        return {
            name: faker.name.firstName(),
            lastName: faker.name.lastName(),
            company: faker.company.companyName(),
            address: faker.address.city()
        }
    })
        .pipe(xmlWrite({
            filePath: generatedFile,
            nodeName: "Person"
        }))
        .count()
    return generatedFile
}