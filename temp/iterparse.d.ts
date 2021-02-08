/// <reference types="node" />
import { AsyncIterable as AsyncIterable_2 } from 'ix';
import { GuessableDelimiters } from 'papaparse';
import { Headers } from 'node-fetch';
import * as Papa_2 from 'papaparse';
import { RequestInit } from 'node-fetch';

declare type AnyIterable<T> = Iterable<T> | AsyncIterable<T>;

/**
 * Function will read big files in memory efficient way.
 * @param options.filePath - Path to file
 * @example
 *  import { bufferRead } from 'iterparse'
 *
 *  bufferRead({ filePath: "path/to/file" })
 *      .map((buffer)=> console.log(buffer.byteLength))
 *      .count()
 * @example
 *  import { bufferRead } from 'iterparse'
 *
 *  for await (const buffer of bufferRead({ filePath: "path/to/file" })) {
 *      console.log(q.byteLength)
 *  }
 * @category Buffer
 */
export declare function bufferRead(options: BufferReadOptions): AsyncIterable_2<Buffer>;

export declare interface BufferReadOptions extends FileReference, ProgressReportOptions {
}

/**
 * Function will write buffer to file
 * @param data - Any iteratable that extends `AnyIteratable<string | Buffer>` type.
 * @example
 *  import { AsyncIterable } from 'ix'
 *  import { bufferWrite } from 'iterparse'
 *  AsyncIterable.from(["one", "two", "three"]).pipe(bufferWrite({ filePath: "path/to/file" }))
 * @example
 *  import { AsyncIterable } from 'ix'
 *  import { bufferWrite } from 'iterparse'
 *  bufferWrite(getBufferIter() ,{ filePath: "path/to/file" }).count()
 * @category Buffer
 */
export declare function bufferWrite(options: BufferWriteOptions): (data: AnyIterable<Buffer | string>) => AsyncIterable_2<Buffer>;

export declare function bufferWrite(data: AnyIterable<Buffer | string>, options: BufferWriteOptions): AsyncIterable_2<Buffer>;

export declare interface BufferWriteOptions extends FileReference {
    mode?: 'overwrite' | 'append';
}

/**
 * Cache iterator output to file.
 * Useful when we need develop complex iterator pipelines.
 * @param options - Check more information in {@link CacheIterOptions}
 * @include ./cache-iter.md
 * @example
 *  import { cacheIter } from 'iterparse'
 *
 *  getFeed() // If cache exists get feed function will not be called
 *      .pipe(cacheIter({ cacheFolder: "./_cache" }))
 *      .count()
 *
 * @example
 *  import { cacheIter } from 'iterparse'
 *
 *  const cachedIter = cacheIter(getFeed(), { cacheFolder: "./_cache" })
 *
 *  for await (const item of cachedIter) {
 *      console.log(item)
 *  }
 * @category Utility
 */
export declare function cacheIter<T>(options: CacheIterOptions): (data: AnyIterable<T>) => AsyncIterable_2<T>;

export declare function cacheIter<T>(data: AnyIterable<T>, options: CacheIterOptions): AsyncIterable_2<T>;

export declare interface CacheIterOptions extends ProgressReportOptions {
    cacheFolder: string;
    enabled?: boolean;
    referenceId?: string;
    /**
     * @defaultValue true
     */
    deleteOnChangedReferenceId?: boolean;
    /**
     * @defaultValue true
     */
    deleteOnChangedIteratableId?: boolean;
    nice?: {
        buffer: number;
    };
    logger?: Pick<Console, 'info'>;
}

/**
 * Read CSV file. In memory efficient way.
 * @example
 *  import { csvRead } from 'iterparse'
 *  csvRead({ filePath: 'path/to/file' })
 *      .map((q)=> console.log(q))
 *      .count()
 *
 * @example
 *  import { csvRead } from 'iterparse'
 *  for await (const item of csvRead({ filePath: 'path/to/file' })) {
 *      console.log(item)
 *  }
 * @param options - {@link CSVReadOptions}
 * @category CSV
 */
export declare function csvRead<T>(options: CSVReadOptions): AsyncIterable_2<ParsingResult<T>>;

export declare interface CSVReadOptions extends ProgressReportOptions, FileReference {
    /**
     *
     */
    onError?: (item: ParsingResult<unknown>) => any;
    /**
     * The delimiting character. Leave blank to auto-detect from a list of most common delimiters, or any values passed in through delimitersToGuess.
     * * It can be a string or a function. If string, it must be one of length 1.
     * * If a function, it must accept the input as first parameter and it must return a string which will be used as delimiter.
     * * In both cases it cannot be found in Papa.BAD_DELIMITERS.
     *
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     */
    delimiter?: string;
    /**
     * The newline sequence. Leave blank to auto-detect. Must be one of \r, \n, or \r\n.
     *
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue  `"\r\n"`
     */
    newline?: string;
    /**
     * The character used to quote fields. The quoting of all fields is not mandatory. Any field which is not quoted will correctly read.
     *
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `"`
     */
    quoteChar?: string;
    /**
     * The character used to escape the quote character within a field. If not set, this option will default to the value of quoteChar, meaning that the default escaping of quote character within a quoted field is using the quote character two times. (e.g. "column with ""quotes"" in text")
     *
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     *
     * @defaultValue `"`
     */
    escapeChar?: string;
    /**
     * If true, the first row of parsed data will be interpreted as field names.
     * An array of field names will be returned in meta, and each row of data will be an object of values keyed by field name instead of a simple array.
     * Rows with a different number of fields from the header row will produce an error.
     *
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     *
     * @warning
     * Duplicate field names will overwrite values in previous fields having the same name.
     * @defaultValue `true`
     */
    header?: boolean;
    /**
     * Trims white space from header values.
     * Requires that `options.header === true`
     *
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     *
     * @defaultValue `true`
     */
    trimHeaders?: boolean;
    /**
     * If true, numeric and boolean data will be converted to their type instead of remaining strings.
     * Numeric data must conform to the definition of a decimal literal.
     * Numerical values greater than 2^53 or less than -2^53 will not be converted to numbers to preserve precision.
     * European-formatted numbers must have commas and dots swapped.
     * If also accepts an object or a function. If object it's values should be a boolean to indicate if dynamic typing should be applied for each column number (or header name if using headers).
     * If it's a function, it should return a boolean value for each field number (or name if using headers) which will be passed as first argument.
     *
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     *
     * @warning
     * This option will reduce parsing performance
     *
     * @defaultValue `false`
     */
    dynamicTyping?: boolean | {
        [headerName: string]: boolean;
        [columnNumber: number]: boolean;
    } | ((field: string | number) => boolean);
    /**
     * The encoding to use when opening local files. If specified, it must be a value supported by the FileReader API.
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `utf8`
     */
    encoding?: string;
    /**
     * A string that indicates a comment (for example, "#" or "//"). When Papa encounters a line starting with this string, it will skip the line.
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `false`
     */
    comments?: boolean | string;
    /**
     * If true, lines that are completely empty (those which evaluate to an empty string) will be skipped. If set to 'greedy', lines that don't have any content (those which have only whitespace after parsing) will also be skipped.
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `true`
     */
    skipEmptyLines?: boolean | 'greedy';
    /**
     * Fast mode speeds up parsing significantly for large inputs. However, it only works when the input has no quoted fields. Fast mode will automatically be enabled if no " characters appear in the input. You can force fast mode either way by setting it to true or false.
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `undefined`
     */
    fastMode?: boolean;
    /**
     * An array of delimiters to guess from if the delimiter option is not set.
     * More information [papaparse.com](https://www.papaparse.com/docs#config)
     * @defaultValue `[',', '\t', '|', ';']`
     */
    delimitersToGuess?: GuessableDelimiters[];
}

/**
 * Writes json objects to file in ".csv" format
 * @param data - Any iteratable.
 * @param options - Write options
 * @include ./CSVOptions.md
 * @signature
 *  cswWrite(option)(iteratable)
 * @signature
 *  cswWrite(iteratable,option)
 * @example
 *  import { csvWrite } from 'iterparse'
 *  AsyncIterable.from([{...},{...},{...}])
 *      .pipe(csvWrite({ filePath: "path/to/file" }))
 *      .count()
 * @example
 *  import { csvWrite } from 'iterparse'
 *  csvWrite([{ a: 1, b: 2 },{ a: 1, b: 2 }], { filePath: "/path/to/file" })
 *      .count()
 * @category CSV
 */
export declare function csvWrite<T extends {
    [k: string]: unknown;
}>(options: CSVWriteOptions): (data: AnyIterable<T>) => AsyncIterable_2<T>;

export declare function csvWrite<T extends {
    [k: string]: unknown;
}>(data: AnyIterable<T>, out: CSVWriteOptions): AsyncIterable_2<T>;

export declare interface CSVWriteOptions {
}

export declare interface CSVWriteOptions extends FileReference, FileWriteMode {
    /**
     * @defaultValue `false`
     */
    quotes?: boolean | boolean[];
    /**
     * @defaultValue `"`
     */
    quoteChar?: string;
    /**
    * @defaultValue `"`
    */
    escapeChar?: string;
    /**
    * @defaultValue `,`
    */
    delimiter?: string;
    /**
     * @defaultValue `\r\n`
     */
    newline?: string;
    /**
     * @defaultValue `false`
     */
    skipEmptyLines?: boolean | 'greedy';
    columns?: string[];
}

/**
 * Function will download any resource from interned and cache it in local file system.
 *
 * @param url URL to file
 * @param options - {@link DownloadOptions}
 * @returns Iteratable<path/to/file>
 * @example
 *      import { download } from 'iterparse'
 *      download({ url: "url/to/resource.csv", downloadFolder: "/tmp"  })
 *          .flatMap((filePath)=> csvRead({ filePath }))
 *          .map((q)=> console.log(q))
 *          .count()
 * @category Utility
 */
export declare function download(options: DownloadOptions): AsyncIterable_2<string>;

export declare interface DownloadOptions extends RequestInit {
    url: string;
    /**
     * Folder where file will be downloaded
     */
    downloadFolder: string;
    /**
     * Hook for tracking download progress
     * @example
     *      (progress) => console.log(progress.toString())
     */
    progress?: (progress: DownloadProgress) => void;
    /**
     * How often notify about progress?
     * @defaultValue `3000ms`
     */
    progressFrequency?: number;
    /**
     * Resource ID generation logic.
     * Basically we can take some data from response and convert to resource ID
     * Examples
     * * etag - from response headers
     * * last-modified - from response headers
     *
     * If file with same generated resource ID is found file will not be downloaded.
     */
    resourceId?: string | ResourceIDHookFunction;
}

declare class DownloadProgress {
    private url;
    private startTime;
    private totalSize?;
    downloaded: number;
    constructor(url: string, startTime: number, totalSize?: number | undefined);
    add(chunk: number): void;
    toString(): string;
    toJSON(): {
        eta: number;
        progress: number;
        url: string;
        bytesPerSec: number;
        speed: string;
        etaMs: string;
        startTime: number;
        totalSize: number;
        downloaded: number;
    } | {
        url: string;
        bytesPerSec: number;
        speed: string;
        startTime: number;
        totalSize: number | undefined;
        downloaded: number;
        eta?: undefined;
        progress?: undefined;
        etaMs?: undefined;
    };
}

declare interface FastXMLParser {
    /**
    * Node attribute prefix
    * @defaultValue `""`
    * @example
    *      const cfg: FastXMLWriteOptions =  { attributeNamePrefix: "#", attrNodeName: "_" }
    *      const obj = { "_":{ "#id": "1" }, "Person": { ... } } //-> <Person id="1">...</Person>
    */
    attributeNamePrefix?: string;
    /**
    * Node attribute prefix
    * @defaultValue `"_"`
    * @example
    *      const cfg: FastXMLWriteOptions =  { attributeNamePrefix: "#", attrNodeName: "_" }
    *      const obj = { "_":{ "#id": "1" }, "Person": { ... } } //-> <Person id="1">...</Person>
    */
    attrNodeName?: false | string;
    /**
     * Text node key
     * @defaultValue `"#text"`
     * @example
     *      <Node>
     *          Text attribute value
     *          <NodeChild></NodeChild>
     *      </Node>
     */
    textNodeName?: string;
    /**
    * Should we parse node attributes?
    * @defaultValue `false`
    */
    ignoreAttributes?: boolean;
    ignoreNameSpace?: boolean;
    allowBooleanAttributes?: boolean;
    parseNodeValue?: boolean;
    /**
     * Should we parse attributes?
     * * Recommended value is false. Improves parsing performance.
     * @defaultValue `false`
     */
    parseAttributeValue?: boolean;
    arrayMode?: boolean | 'strict' | RegExp | ((tagName: string, parentTagName: string) => boolean);
    trimValues?: boolean;
    /**
     * @defaultValue `"__cdata"`
     */
    cdataTagName?: false | string;
    /**
     * @defaultValue `"\\c"`
     */
    cdataPositionChar?: string;
    /**
     * Should we parse number values?
     * Recommended value is false. Improves parsing speed
     * @defaultValue false
     */
    parseTrueNumberOnly?: boolean;
    /**
     * How tag value is processed?
     */
    tagValueProcessor?: (tagValue: string, tagName: string) => string;
    /**
     * How attribute value is processed?
     */
    attrValueProcessor?: (attrValue: string, attrName: string) => string;
    /**
     * Nodes that are included in this list will not be processed
     */
    stopNodes?: string[];
}

declare interface FastXMLWriteOptions {
    /**
     * Node attribute prefix
     * @example
     *      const cfg: FastXMLWriteOptions =  { attributeNamePrefix: "#", attrNodeName: "_" }
     *      const obj = { "_":{ "#id": "1" }, "Person": { ... } } //-> <Person id="1">...</Person>
     */
    attributeNamePrefix?: string;
    /**
     * Node attribute prefix
     * @example
     *      const cfg: FastXMLWriteOptions =  { attributeNamePrefix: "#", attrNodeName: "_" }
     *      const obj = { "_":{ "#id": "1" }, "Person": { ... } } //-> <Person id="1">...</Person>
     */
    attrNodeName?: false | string;
    /**
     * How text node is formatted?
     */
    textNodeName?: string;
    ignoreAttributes?: boolean;
    cdataTagName?: false | string;
    cdataPositionChar?: string;
    format?: boolean;
    indentBy?: string;
    supressEmptyNode?: boolean;
    tagValueProcessor?: (tagValue: string) => string;
    attrValueProcessor?: (attrValue: string) => string;
}

declare interface FileReference {
    /**
     * File path
     */
    filePath: string;
}

declare interface FileWriteMode {
    /**
    * * `overwrite` will always create or overwrite file
    * * `append` mode will create file if not exist and append objects to file
   * @defaultValue `overwrite`
   */
    mode?: 'append' | 'overwrite';
}

/**
 * Function will read big JSON files in memory efficient way.
 * @param options - More information {@link JSONReadOptions}
 * @example
 *  import { jsonRead } from 'iterparse'
 *  jsonRead({ filePath: "path/to/file.json" })
 *      .map((q)=> console.log(q))
 *      .count()
 * @example
 *  import { jsonRead } from 'iterparse'
 *  for await (const item of jsonRead({ filePath: "path/to/file.json" })) {
 *      console.log(item)
 *  }
 * @category JSON
 */
export declare function jsonRead<T>(options: JSONReadOptions): AsyncIterable_2<T>;

export declare interface JSONReadOptions extends ProgressReportOptions, FileReference {
    /**
     * JSON parsing pattern
     * @example
     *      [{...}, {...}] => *
     *      { a: [{...}, {...}] } => a.*
     *      { a: { b: [{...}, {...}] } } => a.b.*
     */
    pattern: string;
}

/**
 * Function will write iteratable in memory efficient way.
 *
 * @param data any iteratable.
 * @param options #{JSONWriteOptions}#
 * @example
 *  import { AsyncIterable } from 'ix'
 *  import { jsonWrite } from 'iterparse'
 *  AsyncIterable.from([1, 2, 3, 4, 5])
 *      .pipe(jsonWrite({ filePath: "path/to/file.json" }))
 *      .count()
 * @example
 *  import { jsonWrite } from 'iterparse'
 *  jsonWrite([{ a: 1, b: 2 }, { a: 1, b: 2 }], { filePath: "/path/to/file" })
 *      .count()
 * @category JSON
 */
export declare function jsonWrite<T>(options: JSONWriteOptions): (data: AsyncIterable<T>) => AsyncIterable<T>;

export declare function jsonWrite<T>(data: AnyIterable<T>, options: JSONWriteOptions): AsyncIterable_2<T>;

export declare interface JSONWriteOptions extends FileReference, FileWriteMode {
}

declare interface ParsingResult<T> {
    data: T;
    errors: Papa_2.ParseError[];
    meta: Papa_2.ParseMeta;
}

declare class Progress {
    private filePath;
    private totalSize;
    private startTime;
    parsedBytes: number;
    items: number;
    constructor(filePath: string, totalSize: number, startTime: number);
    add(chunk: number): void;
    set(data: {
        currentSize?: number;
        items?: number;
    }): void;
    addItem(count?: number): void;
    toString(): string;
    toJSON(): {
        eta: number;
        filePath: string;
        items: number;
        progress: number;
        etaMs: string;
        bytesPerSec: number;
        speed: string;
        startTime: number;
        totalSize: number;
        parsedBytes: number;
    };
}

declare interface ProgressReportOptions {
    /**
     * Hook for tracking download progress
     */
    progress?: (data: Progress) => void;
    /**
    * How often notify about progress?
    * @defaultValue `1000ms`
    */
    progressFrequency?: number;
}

declare type ResourceIDHookFunction = ((url: string, headers: Headers) => string);

/**
 * Function read xml from file in memory efficient way
 * @includes ./xml-read.md
 * @example
 *  import { xmlRead } from 'iterparse'
 *  xmlRead({ filePath: "./path/to/file.xml" })
 *      .map((q)=> console.log(q))
 *      .count()
 * @example
 *  import { xmlRead } from 'iterparse'
 *  for await (const item of xmlRead({ filePath: "./path/to/file.xml" })) {
 *      console.log(item)
 *  }
 * @category XML
 */
export declare function xmlRead<T>(options: XMLReadOptions): AsyncIterable_2<T>;

export declare interface XMLReadOptions extends ProgressReportOptions, FastXMLParser, FileReference {
    /**
     * Object node name
     * @example
     * nodeName === "Person"
     * <Person>...</Person>
     */
    nodeName: string;
}

/**
 * Writes JSON object iteratable to file in .xml format
 * @param options - More information in { @link XMLWriteOptions }
 * @param data - any iteratable that extends XMLObject type.
 * @example
 *  import { AsyncIterable } from 'ix'
 *  import { xmlWrite } from 'iterparse'
 *
 *  AsyncIterable.from([{ a: 1, b: 2 }, { a: 1, b: 2 }])
 *      .pipe(xmlWrite({ filePath: "path/to/file", nodeName: 'Person' }))
 *      .count()
 * @example
 *  import { xmlWrite } from 'iterparse'
 *
 *  xmlWrite([{...}, {...}], { filePath: 'filePath', nodeName: "Person" })
 *      .count()
 * @category XML
 */
export declare function xmlWrite<T extends {
    [k: string]: unknown;
}>(options: XMLWriteOptions): (data: AnyIterable<T>) => AsyncIterable_2<T>;

export declare function xmlWrite<T extends {
    [k: string]: unknown;
}>(data: AnyIterable<T>, options: XMLWriteOptions): AsyncIterable_2<T>;

export declare interface XMLWriteOptions extends FastXMLWriteOptions, FileReference, FileWriteMode {
    /**
     * Object node name
     * @example
     * nodeName === "Person"
     * <Person>...</Person>
     */
    nodeName: string;
}

export { }
