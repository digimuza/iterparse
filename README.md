# Introduction

Data parsing using ES6 Async Iterators

### What problem this package solves?

Processing huge files in `Node.js` can be hard. Especially when you need execute send or retrieve data from external sources.

This package

1. Parse big *CSV* | *XML* | *JSON* files in memory efficient way.
2. Write data to *CSV* | *JSON* | *XML* file in memory efficient way.

# Installation

Async iterators are natively supported in Node.js **10.x.** If you're using Node.js **8.x** or **9.x**, you need to use Node.js' `--harmony_async_iteration` flag.

Async iterators are **not supported** in Node.js **6.x** or **7.x**, so if you're on an older version you need to upgrade Node.js to use async iterators.

```bash
$ npm install itterparse
```

Or using `yarn`

```bash
$ yarn add itterparse
```

# Documentation

## General usage

For processing iterators I recommend to use [IxJS](https://github.com/ReactiveX/IxJS) library

```typescript
import { AsyncIterable } from "ix";
import { map } from "ix/asynciterable/operators";
import { csvRead, csvWrite } from "iterparse";

interface MyCSVObject {
  prop1: string;
  prop2: boolean;
  prop3: number;
}

AsyncIterable
    .from(csvRead<MyCSVObject>("./big_csv_file.csv"))
    .map((obj) => {
        // transform object in any way
        return {
            a: obj.prop3 * 5,
            b: obj.prop1 * 2
        };
    })
    .pipe(csvWrite("./big_csv_file_2.csv"))
);
```

Or just loop iterators like this

```typescript
async function process() {
  for await (const data of csvRead<MyCSVObject>("./big_csv_file.csv")) {
    // Do anything with data
  }
}
```

#### Real world examples

Usage in e-commerce
Big e-shops can have feeds with 100k or more products. load all this data at once is really in practical.

```typescript
const productCount = 100000;
const productSizeInKb = 20;
const totalMemoryConsumption = productCount * productSizeInKb * 1024; // 2gb of memory just to load data
```

So base on this calculation we will use **2gb** of memory just to load data when we start working with data memory footprint will grow 6, 10 times.
We can use node streams to solve this problem, but working with streams is kinda mind bending and really hard especially when you need manipulate data in meaningfully way and send data to external source `api` `machine learning network` `database`

Some examples what we what we can do with `iterparse`

```typescript
import { AsyncIterable } from 'ix';
import { xmlRead, jsonWrite } from 'iterparse'

interface Video {
    id: string,
    url: string,
    description: string
}
async function getListOfYoutubeVideos(query: string): Promise<Video[]> {
    // I will not implement real logic here
    // Just have in mind that this function will do some http requests
    ...
}

function getProductBaseInfo(data: XMLObject): { id: string, url: string, title: string  } {...}

AsyncIterable
    .from(xmlRead("./big_product_feed.xml", { pattern: 'product' }))
    .map(getProductBaseInfo) // Extract data that we need
    .map(async ({ title, ...rest })=>{
        const videos = await getListOfYoutubeVideos(title) // And we can little execute our task
            return {
                videos,
                title,
               ...rest
            }
    }).
    .pipe(jsonWrite( `./small_feed_with_videos.json` )) // Write all extracted data to JSON file
    .count() 
    // All iterators must be consumed in any way. 
    // I just pick count(). 
    // Other alternatives are toArray(), forEach(), reduce() ect.
```

Keep in mind this is trivial example but it illustrates how to process huge amounts of data.

## API Reference

#### Base

- Output - Valid path to file or writable stream
  ```typescript
  type Output = string | NodeJS.WriteStream;
  ```
- Source - Valid path or readable stream
  ```typescript
  type Source = string | NodeJS.ReadableStream;
  ```

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
    skipEmptyLines?: boolean | "greedy"; // default: false
    columns?: string[]; // default: null
  }
  type CSVObject = { [k: string]: string | boolean | number };

  function csvWrite<T extends CSVObject>(
    out: Output
  ): OperatorAsyncFunction<T, T>;
  function csvWrite<T extends CSVObject>(
    data: AnyIterable<T>,
    out: Output
  ): AsyncIterableX<T>;
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
    pattern: string;
  }
  function jsonRead<T>(
    source: Source,
    options: JSONReadOptions
  ): AsyncIterable<T>;
  ```
- **jsonWrite** - Writes iterator to JSON file in memory efficient matter.
  Some considerations

  - If file exists function will overwrite file
  - If path does not exists function will path to file

  ```typescript
  export function jsonWrite<T>(out: Output): OperatorAsyncFunction<T, T>;
  export function jsonWrite<T>(
    out: Output,
    data: AnyIterable<T>,
  ): AsyncIterable<T>;
  ```

#### XML

- **xmlRead** - Reads JSON file without loading entire file to memory

  ```typescript
  type XMLAttributes = Record<string, string>;
  type XMLMarkup = XMLObject | string;
  type XMLObject = {
    $name: string; // Tag name
    $attrs?: XMLAttributes; // If tag have attributes
    $text?: string; // If node have mixed content <person>text<friend>asd</friend><person>
    $markup?: ReadonlyArray<XMLMarkup>; // And then we will have markup props
    // In most cases we will have object of this format
    [d: string]:
      | string
      | XMLMarkup
      | XMLAttributes
      | ReadonlyArray<XMLMarkup>
      | undefined
      | Object;
  };
  interface XMLReadOptions {
    pattern: string;
  }
  function xmlRead<T extends XMLObject>(
    source: Source,
    options: { pattern: string }
  ): AsyncIterable<T>;
  ```

  **Usage**
  _path_to_xml.xml_ file

  ```xml
  <root>
      <person>
          <name>Bill</name>
          <id>1</id>
          <age>27</age>
      </person>
      <person>
          <name>Sally</name>
          <id>2</id>
          <age>29</age>
      </person>
      <person>
          <name>Kelly</name>
          <id>3</id>
          <age>37</age>
      </person>
  </root>
  ```

  And in code

  ```typescript
  const xmlIter = xmlRead("./path_to_xml.xml", { patter: "person" });
  for await (const data of xmlIter) {
    // Will receive one by one
    // { name: "Bill",  id: "1", age: "27" }
    // { name: "Sally",  id: "2", age: "29" }
    // { name: "Kelly",  id: "3", age: "37" }
    // Do what ever you want here
    await sendDataToServer(data);
  }
  // Or my prefer way
  import { AsyncIterable } from "ix";
  AsyncIterable.from(xmlRead("./path_to_xml.xml", { patter: "person" })).map(
    async (data) => {
      await sendDataToServer(data);
    }
  );
  ```

- **xmlWrite** - Writes iterator to XML file in memory efficient matter.

  Some considerations

  - If file exists function will overwrite file
  - If path does not exists function will create all folder structure

  ```typescript
  xmlWrite([{ a: 5 }], "./data/sub/ax/we/c.xml"); // Function will create path
  ```

  ```typescript
  export function xmlWrite(
    out: Output
  ): OperatorAsyncFunction<XMLObject, XMLObject>;
  export function xmlWrite(
    out: Output,
    data: AnyIterable<XMLObject>,
  ): AsyncIterable<XMLObject>;
  ```

  **Usage** - It's just trivial example

  ```typescript
  import { AsyncIterable } from "ix";
  const obj = [
    {
      $name: "person",
      name: "John",
      tags: [
        { $name: "tag", $attrs: { id: "1" }, $text: "Senior developer" },
        { $name: "tag", $attrs: { id: "2" }, $text: "Fishing" },
      ],
    },
    {
      $name: "person",
      name: "Bill",
      tags: [{ $name: "tag", $attrs: { id: "3" }, $text: "Gaming" }],
    },
  ];

  AsyncIterable.from(obj) // Converting regular array to AsyncIterable
    .pipe(xmlWrite("result.xml")) // Writing objects to file
    .count(); // Consuming iterator
  ```

  _result.xml_

  ```xml
  <root>
      <person>
          <name>John</name>
          <tags>
              <tag id="1">Senior developer</tag>
              <tag id="2">Fishing</tag>
          </tags>
      </person>
      <person>
          <name>Bill</name>
          <tags>
              <tag id="3">Gaming</tag>
          </tags>
      </person>
  </root>
  ```
