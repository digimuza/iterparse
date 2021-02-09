## BufferWriteOptions

* `filePath` - path to file

* `mode` - write mode

    `@defaultValue` - `overwrite`

    * `append` - Appends each object to file.
    * `overwrite` - Always overwrite existing content. On successful write construct valid JSON file 

* `progress` - Report about write progress

* `progressFrequency` -  How often notify about progress?

    `@defaultValue` - `3000ms`