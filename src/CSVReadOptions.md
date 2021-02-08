## CSVReadOptions

CSVReadOptions extends papa parse config object.

You can read about papa parse config here [papaparse.com](https://www.papaparse.com/docs#config)

* `filePath` - path to file

* `progress` - Reports about json parsing progress

    ```typescript
    csvRead({
        filePath: "path/to/file.json",
        progress: (q) => console.log(q.toString())
    })
    .count()
    ```
    Logs:
    ```
    File: "../to/file.csv", Progress: 10.42%, Items: 4,855, Speed: 10.71MB/s, ETA: 25.8s, Memory: 91.75MB
    ```

    JSON

    ```typescript
    csvRead({
        filePath: "path/to/file.csv",
        progress: (q) => console.log(q.toJSON())
    })
    .count()
    ```

    Logs:
    ```javascript
    {
        eta: 25861.831312410843,
        filePath: "path/to/file.csv",
        items: 4855,
        progress: 0.10422863704581108,
        etaMs: '25.8s',
        bytesPerSec: 11216000,
        speed: '10.7MB/s',
        startTime: 1612718403380,
        totalSize: 323817340,
        parsedBytes: 33751040
    }
    ```
* `progressFrequency` - How often report about processing status?
    
    @defaultValue - 3000ms
