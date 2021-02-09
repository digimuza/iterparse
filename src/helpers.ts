import { relative } from "path"
import prettyMs from 'pretty-ms'
import { URL } from "url"


export function getFileType(contentType: string) {
    if (contentType.includes('application/json')) return '.json'
    if (contentType.includes('text/csv')) return '.csv'
    if (contentType.includes('application/xml')) return '.xml'
    if (contentType.includes('text/xml')) return '.xml'
    return
}

export class DownloadProgress {
    downloaded: number = 0
    constructor(private url: string, private startTime: number, private totalSize?: number) { }
    add(chunk: number) {
        this.downloaded += chunk
    }

    toString() {
        const json = this.toJSON()
        if (json.etaMs) {
            return `URL: "${new URL(this.url).href}", Progress: ${(json.progress * 100).toFixed(2)}%, Downloaded: ${formatBytes(this.downloaded)}, Speed: ${json.speed}, ETA: ${json.etaMs}, Memory: ${formatBytes(process.memoryUsage().heapUsed)}`
        }
        return `URL: "${new URL(this.url).href}", Downloaded: ${formatBytes(this.downloaded)}, Speed: ${json.speed}, Memory: ${formatBytes(process.memoryUsage().heapUsed)}`
    }

    toJSON() {
        const diff = Math.floor(Date.now() - this.startTime)
        const bytesPerMs = Math.floor(this.downloaded / diff) || 0

        if (this.totalSize) {
            const eta = (this.totalSize - this.downloaded) / bytesPerMs || 1 || 0
            const progress = this.downloaded / this.totalSize
            return {
                eta,
                progress,
                url: this.url,
                bytesPerSec: bytesPerMs * 1000,
                speed: `${formatBytes(bytesPerMs * 1000)}/s`,
                etaMs: prettyMs(eta === Infinity ? 0 : eta),
                startTime: this.startTime,
                totalSize: this.totalSize,
                downloaded: this.downloaded,
            }
        }

        return {
            url: this.url,
            bytesPerSec: bytesPerMs * 1000,
            speed: `${formatBytes(bytesPerMs * 1000)}/s`,
            startTime: this.startTime,
            totalSize: this.totalSize,
            downloaded: this.downloaded,
        }
    }
}


export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

export interface ProgressReportOptions {
    /**
     * Hook for tracking download progress
     */
    progress?: (data: Progress) => void
    /**
    * How often notify about progress?
    * @defaultValue `1000ms`
    */
    progressFrequency?: number
}


export class Progress {
    parsedBytes: number = 0
    items = 0
    constructor(private filePath: string, private totalSize: number, private startTime: number) { }
    add(chunk: number) {
        this.parsedBytes += chunk
    }
    set(data: { currentSize?: number, items?: number }) {
        if (data.currentSize) {
            this.parsedBytes = data.currentSize
        }
        if (data.items) {
            this.items = data.items
        }
    }
    addItem(count: number = 1) {
        this.items += count
    }
    toString() {
        const json = this.toJSON()
        if (json.progress === 0) {
            return `File: "${relative(process.cwd(), this.filePath)}", Progress: 0%`
        }
        return `File: "${relative(process.cwd(), this.filePath)}", Progress: ${(json.progress * 100).toFixed(2)}%, Items: ${this.items.toLocaleString()}, Speed: ${json.speed}, ETA: ${json.etaMs}, Memory: ${formatBytes(process.memoryUsage().heapUsed)}`
    }

    toJSON() {
        const diff = Math.floor(Date.now() - this.startTime)
        const bytesPerMs = Math.floor(this.parsedBytes / diff) || 0
        const eta = (this.totalSize - this.parsedBytes) / bytesPerMs || 1 || 0
        return {
            eta,
            filePath: this.filePath,
            items: this.items,
            progress: this.parsedBytes / this.totalSize,
            etaMs: prettyMs(eta === Infinity ? 0 : eta),
            bytesPerSec: bytesPerMs * 1000,
            speed: `${formatBytes(bytesPerMs * 1000)}/s`,
            startTime: this.startTime,
            totalSize: this.totalSize,
            parsedBytes: this.parsedBytes,
        }
    }
}



export interface WriteProgressReportOptions {
    /**
     * Hook for tracking download progress
     */
    progress?: (data: WriteProgress) => void
    /**
    * How often notify about progress?
    * @defaultValue `3000ms`
    */
    progressFrequency?: number
}

export class WriteProgress  {
    writedBytes: number = 0
    items = 0
    constructor(private filePath: string, private startTime: number) { }
    add(chunk: number) {
        this.writedBytes += chunk
    }
    set(data: { currentSize?: number, items?: number }) {
        if (data.currentSize) {
            this.writedBytes = data.currentSize
        }
        if (data.items) {
            this.items = data.items
        }
    }
    addItem(count: number = 1) {
        this.items += count
    }
    toString() {
        const json = this.toJSON()
        return `Writing. File: "${relative(process.cwd(), this.filePath)}", Items: ${this.items.toLocaleString()}, Speed: ${json.speed}, Memory: ${formatBytes(process.memoryUsage().heapUsed)}`
    }

    toJSON() {
        const diff = Math.floor(Date.now() - this.startTime)
        const bytesPerMs = Math.floor(this.writedBytes / diff) || 0
        return {
            filePath: this.filePath,
            items: this.items,
            bytesPerSec: bytesPerMs * 1000,
            speed: `${formatBytes(bytesPerMs * 1000)}/s`,
            startTime: this.startTime,
            writedBytes: this.writedBytes,
        }
    }
}