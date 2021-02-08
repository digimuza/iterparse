## CacheIterOptions

* `cacheFolder` - where cache data will be stored?
* `enabled` - is cache enabled?

    Easy way to enable or disable caching logic

    `@defaultValue` - `true`

* `referenceId` - when reference id changes cache folder will be regenerated.

    `@defaultValue` - `hash(new Date().toDateString() + iteratableStructure + JSON.stringify(options.nice))` basically this means regenerate cache every single day

    `iteratableStructure` - Any changes to source iteratable may regenerate cache
        
    ```typescript
    getFeed()
        .take(1000) // Changes to take count will regenerate cache
        .pipe(cacheIter({ cacheFolder: "./folder" }))
        .count()

    ``` 

    `Note`: If you want to disable cache regeneration logic just hard code `referenceId` as static value

    ```typescript
    getFeed()
        .pipe(cacheIter({ cacheFolder: "./folder", referenceId: "v1" }))
        .count()

    ``` 

    Also keep in mind that `referenceId` can be function. 

     ```typescript
    getFeed()
        .pipe(cacheIter({ 
            cacheFolder: "./folder", 
            referenceId: ({ iteratableStructureId, nice }) => new Date().toDateString() + iteratableStructure + JSON.stringify(nice)
        }))
        .count()

    ```  
* `nice` - format cache in human readable `JSON` format.

    * `nice.buffer` - how big is single file? 
        
        Recommended value is `3000` objects

    Keep in mind that this option can create a lot of files

* `logger` - helpful for debugging purposes