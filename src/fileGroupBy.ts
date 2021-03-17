import { AnyIterable } from "./types"
import { AsyncIterable } from "ix";
import { tmpNameSync } from 'tmp'
import { appendFile, open, read } from "fs-extra";
import * as P from 'ts-prime'
import { formatBytes } from "./helpers";

export interface GroupedItems<T> {
    readonly key: string
    readonly items: ReadonlyArray<T>
}

class GroupingProgressDisplay {
    constructor(private progress: GroupingProgress) {}

    toString() {
        const json = this.toJSON()
        if (this.progress.state === 'IDLE') {
            return `Grouping idle...`
        }
        if (this.progress.state === 'GROUPING') {
            return `Grouping, Items: ${this.progress.groupedItems.toLocaleString()}, Total Groups: ${json.groupedGroups}, Grouped Size: ${formatBytes(json.groupedBytes)}, Memory: ${formatBytes(json.memory)}`
        }
        return `Reading, Progress: ${((json.readedItems/json.groupedItems) * 100).toFixed(2)}%, Groups: ${json.readedGroups}/${json.groupedGroups}, Memory: ${formatBytes(json.memory)}` 
    }

    toJSON() {
        const groupingDiff = Math.floor(Date.now() - this.progress.parsingStartTime)
        const groupingBytesPerMs = Math.floor(this.progress.groupedBytes / groupingDiff) || 0
        const groupingBytesPerSecond = Math.floor(groupingBytesPerMs * 1000)

        const readingDiff = Math.floor(Date.now() - this.progress.parsingStartTime)
        const readingBytesPerMs = Math.floor(this.progress.groupedBytes / readingDiff) || 0
        const readingBytesPerSecond = Math.floor(readingBytesPerMs * 1000)

        return {
            state: this.progress.state,
            groupingBytesPerSecond,
            readingBytesPerSecond,
            memory: process.memoryUsage().heapUsed,
            groupingStartTime: this.progress.parsingStartTime,
            groupingStopTime: this.progress.parsingStopTime,
            readingStartTime: this.progress.readingStartTime,
            readingStopTime: this.progress.readingStopTime,
            groupedItems: this.progress.groupedItems,
            groupedBytes: this.progress.groupedBytes,
            groupedGroups: this.progress.groupedGroups,
            readedItems: this.progress.readedItems,
            readedBytes: this.progress.readedBytes,
            readedGroups: this.progress.readedGroups
        }
    }
}

type GroupingState = "READING" | "GROUPING" | "IDLE";

class GroupingProgress {
    groupedBytes: number = 0
    groupedItems = 0
    groupedGroups = 0

    readedBytes = 0
    readedGroups = 0
    readedItems = 0

    state: GroupingState = 'IDLE'
    parsingStartTime: number = Date.now()
    parsingStopTime: number = Date.now()

    readingStartTime: number = Date.now()
    readingStopTime: number = Date.now()

    start(action: GroupingState) {
        switch(action){
            case 'GROUPING':
                this.state = 'GROUPING'
                this.parsingStartTime = Date.now()
                return
            case 'READING':
                this.state = 'READING'
                this.readingStartTime = Date.now()
                return
            default:
                throw new Error(`Action ${action} not allowed`)
        }
    }

    stop(action: GroupingState) {
        switch(action){
            case 'GROUPING':
                this.parsingStopTime = Date.now()
                return
            case 'READING':
                this.readingStopTime = Date.now()
                return
            default:
                throw new Error(`Action ${action} not allowed`)
        }
    }

    constructor() { }
    addChunk(chunk: number) {
        this.groupedBytes += chunk
    }
    addGroup(group: number) {
        this.groupedGroups += group
    }
    addItem(count: number = 1) {
        this.groupedItems += count
    }


    readChunk(chunk: number) {
        this.readedBytes += chunk
    }
    readGroup(group: number) {
        this.readedGroups += group
    }
    readItem(count: number = 1) {
        this.readedItems += count
    }
    set(data: { currentSize?: number, items?: number }) {
        if (data.currentSize) {
            this.groupedBytes = data.currentSize
        }
        if (data.items) {
            this.groupedItems = data.items
        }
    }
    
    
}

export interface FileGroupByOptions<T> {
    source: AnyIterable<T>;
    groupingFn: (data: T) => number | string;
    progress?: (progress: GroupingProgressDisplay) => void;
    progressFrequency?: number;
}

export function fileGroupBy<T>(args: FileGroupByOptions<T>): AsyncIterable<GroupedItems<T>> {
    const progress: GroupingProgress =  new GroupingProgress()

    let interval: NodeJS.Timeout | undefined
    async function* groupProcess() {
        const tmpFile = tmpNameSync()
        const encoding = 'utf8'
        const fd = await open(tmpFile, 'a+')
        interface GroupRef {
            groups: Map<string, Array<[number, number]>>;
            lastPosition: number;
        }

        const groupFileMap: GroupRef = {
            groups: new Map(),
            lastPosition: 0,
        }
        interval = setInterval(() => {
            if (progress.state === 'IDLE') return
            args.progress?.(new GroupingProgressDisplay(progress))
        }, args.progressFrequency || 1000)

        for await (const value of args.source) {
            
            if (progress.groupedGroups === 0) {
                progress.start('GROUPING')
            }
            const parsedValue = JSON.stringify(value)
            const size = Buffer.byteLength(parsedValue, encoding)
            const groupId = args.groupingFn(value).toString()
            await appendFile(fd, parsedValue, { encoding })

            
            progress.addItem(1)
            progress.addChunk(size)
            const group = groupFileMap.groups.get(groupId)
            if (group == null) {
                progress.addGroup(1)  
            } 

            const newGroup = group || []
            newGroup.push([groupFileMap.lastPosition, size])
            groupFileMap.groups.set(groupId, newGroup)
            groupFileMap.lastPosition = groupFileMap.lastPosition + size
            continue
        }

        args.progress?.(new GroupingProgressDisplay(progress))
        progress.start('READING')
        
        for (const [groupId, mapData] of groupFileMap.groups) {
            progress.readGroup(1)
            yield {
                key: groupId,
                items: await Promise.all(
                    mapData.map(async ([location ,size])=> {
                        progress.readItem(1)
                        progress.readChunk(size)
                        const buffer = Buffer.alloc(size)
                        await read(fd, buffer, 0, size, location)
                        const item = P.canFail(() => {
                            return JSON.parse(buffer.toString(encoding))
                        })
                        if (P.isError(item)) {
                            throw new Error(`Critical error: something went wrong in grouping process`)
                        }
                        return item as T
                    })
                )
            }
        }
        clearInterval(interval)
        args.progress?.(new GroupingProgressDisplay(progress))
    }

    return AsyncIterable.from(groupProcess()).finally(()=>{
        if (interval == null) return 
        clearInterval(interval)
    })
}