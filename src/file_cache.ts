export interface FileCachePersistentOptions {
    cacheType: 'persistent',
    invalidate: string | ((cacheData: { generated: Date, hash: string }) => string),
    cacheDirLocation: string
}

export interface FileCacheTemporallyOptions {
    /** 
     * @param cacheType - This file will be deleted when on process.exit event or function will
     */
    cacheType: 'temporally',
    /**
     * @param cacheDirLocation - This file will be deleted when on process.exit event or function will 
     */
    cacheDirLocation: string
}

export function fileCache<T>(data: AsyncIterable<T>, options: FileCacheTemporallyOptions | FileCachePersistentOptions): AsyncIterable<T> {
    return {} as any
}