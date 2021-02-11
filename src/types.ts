
export interface FileReference {
    /**
     * File path
     */
    filePath: string
}

export interface FileWriteMode {
    /**
    * * `overwrite` will always create or overwrite file
    * * `append` mode will create file if not exist and append objects to file
   * @defaultValue `overwrite`
   */
    mode?: 'append' | 'overwrite'
}

export { AsyncIterable as IX } from 'ix'
export type AnyIterable<T> = Iterable<T> | AsyncIterable<T>
export type AnyIterableValueOf<O> = O extends AnyIterable<infer T> ? T : never