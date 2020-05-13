import { AsyncIterableX } from "ix/asynciterable";

export interface Group<T> {
    key: string,
    count: number,
    items: AsyncIterableX<T>
}

export interface GroupByOptions {
    cacheLocation: string
    invalidate: string | ((cacheData: { generated: Date, hash: string }) => string),
}
export function fileGroupBy<T>(fn: (data: T) => string | ReadonlyArray<string>, options: GroupByOptions): (data: AsyncIterableX<T>) => AsyncIterableX<Group<T>>
export function fileGroupBy<T>(data: AsyncIterableX<T>, fn: (data: T) => string | ReadonlyArray<string>, options: GroupByOptions): AsyncIterableX<Group<T>>
export function fileGroupBy<T>(data: AsyncIterableX<T> | ((data: T) => string | ReadonlyArray<string>), fn: ((data: T) => string | ReadonlyArray<string>) | GroupByOptions, options?: GroupByOptions): AsyncIterableX<Group<T>> | ((data: AsyncIterableX<T>) => AsyncIterableX<Group<T>>) {
    return {} as any
}