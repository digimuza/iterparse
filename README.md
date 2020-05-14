# Introduction
Data parsing using ES6 Async Iterators

### What problem this package solves?

Processing huge files in `Node.js` can be hard. Especially when you need execute send or retrieve data from external sources.

This package

1. Parse big CSV | XML | JSON files in memory efficient way.
2. Write data to CSV | JSON | XML file in memory efficient way.
3. Cache processing to file and restore your processing if something goes wrong. Processing can take hours or even day. 
4. Merge data from multiple streams. Some time you need extract data from two huge files



# Installation
Async iterators are natively supported in Node.js **10.x.** If you're using Node.js **8.x** or **9.x**, you need to use Node.js' `--harmony_async_iteration` flag. Async iterators are not supported in Node.js **6.x** or **7.x**, so if you're on an older version you need to upgrade Node.js to use async iterators.

```bash
$ npm install itterparse
```
Or using `yarn` 
```bash
$ yarn add itterparse
```

# Documentation

## General usage

For processing iterators I recommend  to use [IxJS](https://github.com/ReactiveX/IxJS) library

``` typescript
import { from } from 'ix/asynciterable';
import { map } from 'ix/asynciterable/operators';
import { csvRead, csvWrite } from 'iterparse'

interface MyCSVObject {
    prop1: string,
    prop2: boolean
    prop3: number
}

from(csvRead<MyCSVObject>('./big_csv_file.csv'))
    .pipe(
        map((obj)=>{
            // transform object in any way

            return {
                a: obj.prop3 * 5
            }
        }),
        csvWrite("./big_csv_file_2.csv")
    )
```

Or just loop iterators like this

``` typescript

async function process() {
    for await (const data of csvRead<MyCSVObject>('./big_csv_file.csv')) {
        // Do anything with data
    }
}

```

#### Real world examples

Usage in e-commerce
Big e-shops can have feeds with 100k or more products. load all this data at once is really in practical.

``` typescript

const productCount = 100000
const productSizeInKb = 20
const totalMemoryConsumption = productCount * productSizeInKb * 1024 // 2gb of memory
```

So base on this calculation we will use **2gb** of memory just to load data when we start executing modifications memory footprint will grow 6 or even 10 times. We can use node streams to solve this problem, but that approach is way more complex than this.

Some examples what we what we can do with data

``` typescript
import { from, count } from 'ix/asynciterable';
import { map } from 'ix/asynciterable/operators';
import { xmlRead, jsonWrite } from 'iterparse'

interface Video {
    id: string,
    url: string,
    description: string
}
async function getListOfYoutubeVideos(query: string): Promise<Video[]> { 
    ... // I will not implement real logic here 
}

function getProductBaseInfo(data: XMLObject): { id: string, url: string, title: string  } {...}

from(xmlRead("./big_product_feed.xml", { pattern: 'product' }))
    .pipe(
        map(getProductBaseInfo), // Extract data that we need
        map(async ({ title, ...rest })=>{
            const videos = await getListOfYoutubeVideos(title)
            return {
                videos,
                title,
               ...rest
            }
        }),
        jsonWrite( `./small_feed_with_videos.json` ), // Write all extracted data to JSON file
        count // We need consume iterator in some way. Alternatives are reduce, toArray, forEach, toMap, toSet. Read IxJS documentation to get more information
    )

```

Keep in mind this is trivial example but it illustrates how to process huge amounts of data.

## API Reference

#### CSV
- **csvRead** - Read CSV file row by row.
    ```typescript 
    interface CSVReadOptions {
        delimiter?: string; // default: ","
        newline?: string; // default: "\r\n"
        quoteChar?: string; // default: '"'
        escapeChar?: string; // default: '"'
        header?: boolean; // default: false
        trimHeaders?: boolean; // default: false
        dynamicTyping?: boolean // default true
        encoding?: string; // default: ""
        comments?: boolean | string; // default: false
        skipEmptyLines?: boolean | 'greedy'; // default: false
    }
    type CSVObject = { [k: string]: string | boolean | number }

    function csvRead<T extends CSVObject, options?: CSVWriteOptions>(input: Source): AsyncIterable<T>    
    ```
- **csvWrite** - Writes iterator item to CSV file and returns same item for further processing.
    ```typescript 
    interface CSVWriteOptions {
        quotes?: boolean | boolean[]; // default: false
        quoteChar?: string; // default: '"'
        escapeChar?: string; // default: '"'
        delimiter?: string; // default: ","
        header?: boolean; // default: true
        newline?: string; // default: "\r\n"
        skipEmptyLines?: boolean | 'greedy'; // default: false
        columns?: string[]; // default: null
    }
    type CSVObject = { [k: string]: string | boolean | number }

    function csvWrite<T extends CSVObject>(out: Output): OperatorAsyncFunction<T, T>
    function csvWrite<T extends CSVObject>(data: AsyncIterableX<T>, out: Output): AsyncIterableX<T>    
    ```
#### JSON
- **jsonRead** - Reads JSON file without loading entire file to memory
    ```typescript
    interface JSONReadOptions {
        /**
         * Pattern option to defined where to find array items
         * (* => [{...}, {...}])
         * (*.a) => { a: [{...}, {...}] }
         * (*.a.b) => { a: { b: [{...}, {...}] } }
         */
        pattern: string 
    }
    function jsonRead<T>(source: Source, options: JSONReadOptions): AsyncIterable<T>
    ```
