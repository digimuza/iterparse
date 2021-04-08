import { AsyncIterable } from "ix"
import * as P from 'ts-prime'
import { GroupedItems } from "./fileGroupBy"
import { formatBytes } from "./helpers"
import { AnyIterable } from "./types"


export interface TrailingGroupByArgs<T> {
    groupBy: ((data: T) => string | number) | ((data: T) => Promise<string | number>);
    maxGroupSize: number;
    totalItemsInMemory: number
}

function _trailingGroupBy<T>(data: globalThis.AsyncIterable<T>, args: TrailingGroupByArgs<T>) {
    async function* iter() {
        const stats = {
            totalItemsInMemory: 0
        }
        const groups: Record<string, Array<T>> = {}
        for await (const item of data) {
            const id = await args.groupBy(item).toString()
            if (groups[id] == null) {
                groups[id] = []
            }

            if (stats.totalItemsInMemory >= args.totalItemsInMemory) {
                const item = P.first(P.maxBy(Object.entries(groups), ([, items]) => items.length))
                if (item == null) {
                    stats.totalItemsInMemory = 0
                } else {
                    const [key, items] = item
                    yield {
                        key,
                        items
                    }
                    groups[key] = []
                }
            }

            groups[id].push(item)
            stats.totalItemsInMemory += 1
            if (groups[id].length >= args.maxGroupSize) {
                yield {
                    key: id,
                    items: groups[id]
                }
                stats.totalItemsInMemory -= groups[id].length
                groups[id] = []
            }
            continue
        }
    }

    return AsyncIterable.from(iter())
}

export function trailingGroupBy<T>(args: TrailingGroupByArgs<T>): (data: AnyIterable<T>) => AsyncIterable<GroupedItems<T>>
export function trailingGroupBy<T>(data: AnyIterable<T>, args: TrailingGroupByArgs<T>): AsyncIterable<GroupedItems<T>>
export function trailingGroupBy() {
    return P.purry(_trailingGroupBy, arguments)
}


export interface TrailingMapArgs<T, R> {
    mapFunc: (data: T) => Promise<R>
    maxConcurrency: number
}

function _trailingMap<T, R>(data: AnyIterable<T>, args: TrailingMapArgs<T, R>) {
    async function* iter() {
        let done = false
        const iter = AsyncIterable.from(data)[Symbol.asyncIterator]()
        const requestQueue: Array<{ id: number, request: Promise<{ id: number, result: R }> }> = []

        while (!done) {
            const id = Date.now()
            let value = iter.next().then(async (q) => {
                const req = await args.mapFunc(q.value)
                if (q.done) {
                    done = true
                }
                return {
                    id,
                    result: req
                }
            })
            requestQueue.push({
                id, request: value
            })

            if (requestQueue.length === args.maxConcurrency) {
                const result = await Promise.race(requestQueue.map((q) => q.request))
                requestQueue.splice(requestQueue.findIndex((q) => q.id === result.id), 1)
            }
        }

        while (requestQueue.length !== 0) {
            const result = await Promise.race(requestQueue.map((q) => q.request))
            requestQueue.splice(requestQueue.findIndex((q) => q.id === result.id), 1)
        }
    }
    return AsyncIterable.from(iter())
}


export function trailingMap<T, R>(args: TrailingMapArgs<T, R>): (data: AnyIterable<T>) => AsyncIterable<R>
export function trailingMap<T, R>(data: AnyIterable<T>, args: TrailingMapArgs<T, R>): AsyncIterable<R>
export function trailingMap() {
    return P.purry(_trailingMap, arguments)
}

function _onDone<T>(data: AnyIterable<T>, callback: () => void) {
    async function* iter() {
        for await (const item of data) {
            yield item
        }
        callback()
    }

    return AsyncIterable.from(iter())
}


export function onDone<T>(callback: () => void): (data: AnyIterable<T>) => AsyncIterable<T>
export function onDone<T>(data: AnyIterable<T>, callback: () => void): AsyncIterable<T>
export function onDone() {
    return P.purry(_onDone, arguments)
}

class ProgressTrack {
    items = 0
    isRunning = false
    startTime = 0

    rollingDurations: number[] = []
    addItem() {
        if (this.startTime !== 0) {
            this.rollingDurations.push(Date.now() - this.startTime)
            if (this.rollingDurations.length >= 20) {
                this.rollingDurations.shift()
            }
        }
        this.items += 1
        this.isRunning = true
        this.startTime = Date.now()
    }

    get average() {
        const mean = P.stats(this.rollingDurations, (q) => q).arithmetic_mean
        return mean
    }
}

class Progress {
    constructor(private progress: ProgressTrack) { }
    toString() {
        const speed = this.progress.items > 1 ? ` Speed: ${(1 / (this.progress.average / 1000)).toFixed(2)} items/s,` : ""
        return `Items: ${this.progress.items.toLocaleString()},${speed} Memory: ${formatBytes(process.memoryUsage().heapUsed)}`
    }
    toJSON() {
        return {
            speed: 1 / (this.progress.average / 1000),
            items: this.progress.items
        }
    }
}

interface OnProgressArgs {
    progress: (data: Progress) => void
    progressFrequency?: number
}


function _onProgress<T>(data: AnyIterable<T>, args: OnProgressArgs) {
    const progressInstance = new ProgressTrack()

    const interval = setInterval(() => {
        args.progress(new Progress(progressInstance))
    }, args.progressFrequency || 2000)

    async function* iter() {
        for await (const item of data) {
            progressInstance.addItem()
            yield item
        }
    }

    args.progress(new Progress(progressInstance))

    return AsyncIterable.from(iter()).finally(() => {
        clearInterval(interval)
    })
}

export function onProgress<T>(args: OnProgressArgs): (data: AnyIterable<T>) => AsyncIterable<T>
export function onProgress<T>(data: AnyIterable<T>, args: OnProgressArgs): AsyncIterable<T>
export function onProgress() {
    return P.purry(_onProgress, arguments)
}
