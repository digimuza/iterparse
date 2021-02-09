# Introduction

Data parsing using ES6 Async Iterators


[Online documentation](https://digimuza.github.io/iterparse/) 


### What problem this package solves?

Processing huge files in `Node.js` can be hard. Especially when you need execute send or retrieve data from external sources.

This package solves

1. Parse big `CSV | XML | JSON` files in memory efficient way.
2. Write data to `CSV | JSON | XML` file in memory efficient way.

# Installation

Async iterators are natively supported in `Node.js` **10.x.** If you're using `Node.js` **8.x** or **9.x**, you need to use `Node.js`' `--harmony_async_iteration` flag.

Async iterators are **not supported** in `Node.js` **6.x** or **7.x**, so if you're on an older version you need to upgrade `Node.js` to use async iterators.

```bash
$ npm install iterparse
```

Or using `yarn`

```bash
$ yarn add iterparse
```

# Benchmarks

Run all benchmarks

```
    git clone https://github.com/digimuza/iterparse.git &&
    cd ./iterparse/benchmarks &&
    yarn && 
    yarn run
```


All benchmarks are executed with on `AMD 2600x` processor.

Benchmarks source code [here](https://github.com/digimuza/iterparse/blob/master/benchmarks)

## CSV Parsing

Parsing 1 million records of random generated data.
> Data was generated using [this](https://github.com/digimuza/iterparse/blob/master/benchmarks/src/csv/generate.ts). script 

<div style="background: transparent;">
    <div style="width: 33%; background: rgb(24, 144, 255); padding: 5px; margin-bottom: 20px"><h6 style="color: white">csv-parser - 2.8 s<h6></div>
    <div style="width: 40%; background: rgb(250, 140, 22); padding: 5px; margin-bottom: 20px"><h6 style="color: white">iterparse - 3.4 s<h6></div>
    <div style="width: 100%; background: rgb(250, 140, 22); padding: 5px;"><h6 style="color: white">fast-csv - 8.3 s<h6></div>
</div>


## XML

Parsing 1 million records of random generated data. 
> Data was generated using [this](https://github.com/digimuza/iterparse/blob/master/benchmarks/src/xml/generate.ts). script 

<div style="background: transparent;">
    <div style="width: 13%; background: rgb(24, 144, 255); padding: 5px; margin-bottom: 20px"><h6 style="color: white">iterparse - 11 s<h6></div>
</div>


## JSON

Parsing 1 million records of random generated data. 
> Data was generated using [this](https://github.com/digimuza/iterparse/blob/master/benchmarks/src/json/generate.ts). script 

<div style="background: transparent;">
    <div style="width: 100%; background: rgb(24, 144, 255); padding: 5px; margin-bottom: 20px"><h6 style="color: white">iterparse - 3.5 s<h6></div>
</div>

# Documentation

## General usage

For processing iterators I recommend to use [IxJS](https://github.com/ReactiveX/IxJS) library

#### Real world examples

Usage in e-commerce
Big e-shops can have feeds with 100k or more products. load all this data at once is really in practical.

```typescript
const productCount = 100000;
const productSizeInKb = 20;
const totalMemoryConsumption = productCount * productSizeInKb * 1024; // 2gb of memory just to load data
```

So base on this calculation we will use **2gb** of memory just to load data when we start working with data memory footprint will grow 6, 10 times.


We can use node streams to solve this problem, but working with streams is kinda mind bending and really hard especially when you need manipulate data in meaningfully way and send data to external source `api` `machine learning network` `database` ect.

Some examples what we what we can do with `iterparse`

```typescript
import { AsyncIterable } from 'ix';
import { xmlRead, jsonWrite } from 'iterparse'

interface Video {
    id: string,
    url: string,
    description: string
}
async function getListOfYouTubeVideos(url: string): Promise<Video[]> {
    // I will not implement real logic here
    // Just have in mind that this function will do some http requests
    // It will take time to do all this logic
    ...

    return {...} // Big json object
}

// Extracting all <product></product> nodes from xml file
// Let's assume that "./big_product_feed.xml" have 20 million records and file size is 30gb
// This script would use around 50mb of RAM
xmlRead<Video>({ filePath: "./big_product_feed.xml", pattern: 'product' })
    .map(async ({ url })=>{
       return getListOfYouTubeVideos(url)
    })
    // Write all extracted data to JSON file
    .pipe(jsonWrite({ filePath: "./small_feed_with_videos.json" }))
    .count()
    // All iterators must be consumed in any way.
    // I just pick count()
    // Other alternatives are toArray(), forEach(), reduce() ect.
```

Keep in mind this is trivial example but it illustrates how to process huge amounts of data.

### Simple csv to json converter.

```typescript
import { csvRead, jsonWrite } from "iterparse";

csvRead({ filePath: "./big_csv_file.csv" })
  .pipe(jsonWrite({ filePath: "big_json_file.json" }))
  .count();
```


### Data aggregation

```typescript
import { csvRead, jsonWrite } from "iterparse";

// CSV file with 100 million sales records
csvRead<{ id: string, price: number, qty: number, margin: number }>({ filePath: "./sales.csv" })
  .reduce((acc, item)=> acc + ((item.qty * item.price) * item.margin), 0)
  .then((profit) => {
      console.log(`Yearly profit ${profit}$`)
  });
```

### Extract breweries from open api 

```typescript

import fetch from 'node-fetch'
import { jsonWrite } from './json'
async function* extractBreweries() {
    let page = 0
    while (true) {
        const url = `https://api.openbrewerydb.org/breweries?page=${page}`
        console.log(`Extracting: "${url}"`)
        const response = await fetch(`https://api.openbrewerydb.org/breweries?page=${page}`)
        if (!response.ok) {
            throw new Error(`Failed get ${url}`)
        }

        const body = await response.json()
        if (Array.isArray(body) && body.length !== 0) {
            for (const item of body) {
                yield item
            }
            page++
            continue
        }

        return
    }
}

jsonWrite(extractBreweries(), { filePath: 'breweries.json' }).count()

```

