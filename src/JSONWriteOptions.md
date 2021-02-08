
## JSONWriteOptions

* `filePath` - path to file

* `mode` - write mode

    `@defaultValue` - `overwrite`

    * `append` - Appends each object to file.
    
        When this `mode` is enabled `jsonWrite` function will not construct valid JSON file.

        Constructed file example
        ```json
        {...},
        {...},
        {...}
        ```

        Notice that we missing `[` in beginning and `]` in the end
    * `overwrite` - Always overwrite existing content. On successful write construct valid JSON file 