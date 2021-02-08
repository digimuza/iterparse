import { createWriteStream } from 'fs'
import { ProgressReportOptions } from "./helpers";
import { AsyncIterable } from "ix";
import { bufferRead } from "./buffer";
import * as Parser from 'fast-xml-parser'
import { isString, purry } from "ts-prime";
import * as he from 'he'
import { ensureFile } from 'fs-extra'
import { AnyIterable, FileReference, FileWriteMode, IX } from "./types";

export interface FastXMLParser {
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
export interface XMLReadOptions extends ProgressReportOptions, FastXMLParser, FileReference {
    /**
     * Object node name
     * @example
     * nodeName === "Person"
     * <Person>...</Person>
     */
    nodeName: string
}
export interface FastXMLWriteOptions {
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

export interface XMLWriteOptions extends FastXMLWriteOptions, FileReference, FileWriteMode {
    /**
     * Object node name
     * @example
     * nodeName === "Person"
     * <Person>...</Person>
     */
    nodeName: string
}

function _xmlWrite<T extends { [k: string]: unknown }>(data: AnyIterable<T>, options: XMLWriteOptions): AsyncIterable<T> {
    return IX.defer(async () => {
        const mode = options.mode || 'overwrite'
        let loaded = false
        let dest: NodeJS.WritableStream = undefined as unknown as NodeJS.WritableStream
        async function* iter() {
            const defaultOptions: FastXMLWriteOptions = {
                attributeNamePrefix: "",
                attrNodeName: "_", //default is false
                textNodeName: "#text",
                ignoreAttributes: false,
                cdataTagName: "__cdata", //default is false
                cdataPositionChar: "\\c",
                format: false,
                indentBy: "  ",
                supressEmptyNode: false,
                tagValueProcessor: a => {
                    if (isString(a)) return he.encode(a, { useNamedReferences: true })
                    return a
                },// default is a=>a
                attrValueProcessor: a => {
                    if (!isString(a)) return a
                    return he.encode(a, { useNamedReferences: true })// default is a=>a
                }
            }
            const parser = new Parser.j2xParser({
                ...defaultOptions,
                ...options
            })
            const i = IX.from(data)
            
            for await (const s of i) {
                if (!loaded) {
                    await ensureFile(options.filePath)
                    dest = createWriteStream(options.filePath, { flags: mode === 'append' ? 'a' : 'w' })
                    if (mode === 'overwrite') {
                        dest.write("<root>\r\n")
                    }
                    loaded = true
                }
                const result = parser.parse({ [options.nodeName]: s })
                dest.write(`${result}\r\n`)
                yield s
            }
        }

        return IX.from(iter()).finally(() => {
            if (mode === 'overwrite') {
                dest.write("</root>")
            }
        })
    })
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
export function xmlWrite<T extends { [k: string]: unknown }>(options: XMLWriteOptions): (data: AnyIterable<T>) => IX<T>
export function xmlWrite<T extends { [k: string]: unknown }>(data: AnyIterable<T>, options: XMLWriteOptions): IX<T>
export function xmlWrite() {
    return purry(_xmlWrite, arguments)
}

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
export function xmlRead<T>(options: XMLReadOptions): IX<T> {
    let last = ''
    const defaultOptions: FastXMLParser = {
        attributeNamePrefix: "",
        attrNodeName: "_", //default is 'false'
        textNodeName: "#text",
        ignoreAttributes: false,
        ignoreNameSpace: false,
        allowBooleanAttributes: false,
        parseNodeValue: true,
        parseAttributeValue: false,
        trimValues: true,
        cdataTagName: "__cdata", //default is 'false'
        cdataPositionChar: "\\c",
        parseTrueNumberOnly: false,
        arrayMode: false, //"strict"
    }
    let count = 0
    async function* iter() {
        for await (const buffer of bufferRead({
            ...options,
            progress: (q) => {
                q.set({
                    items: count
                })
                options.progress?.(q)
            }
        })) {
            const full = `${last}${buffer.toString()}`
            const beef = full.replace(new RegExp(`<${options.nodeName}`, 'gm'), `!@###@!<${options.nodeName}`).split(`!@###@!`)
            last = beef.pop() || ''
            for (const qwe of beef) {
                if (!qwe.includes(`<${options.nodeName}`)) {
                    continue
                }
                yield Parser.parse(qwe, {
                    ...defaultOptions,
                    ...options

                })[options.nodeName]
                count++
            }
        }
    }

    return AsyncIterable.from(iter())
}