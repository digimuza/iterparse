import faker from 'faker'
import { xmlWrite } from 'iterparse'
import { AsyncIterable } from 'ix'
import { range } from 'ix/asynciterable'
import { resolve } from 'path'



AsyncIterable.from(range(0, (1000 * 1000) + 1)).map((q) => {
    return {
        name: faker.name.firstName(),
        lastName: faker.name.lastName(),
        company: faker.company.companyName(),
        address: faker.address.city()
    }
})
    .pipe(xmlWrite({
        filePath: resolve(__dirname, "./_downloads/generated.xml"),
        nodeName: "Person"
    }))
    .count()