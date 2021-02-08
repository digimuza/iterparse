## DownloadOptions

Download option are extended have same options as `RequestInit`

[RequestInit](https://www.npmjs.com/package/node-fetch#options) options


* `url` - link to file

* `downloadFolder` - path where downloaded content will be stored

* `progress` - reports about download progress

    ```typescript
    download({
        url: "url/to/resource.json",
        progress: (q) => console.log(q.toString())
    })
    .count()
    ```
    Logs:
    ```
    URL: "url/to/resource.json", Progress: 10.42%, Speed: 10.71MB/s, ETA: 25.8s, Memory: 91.75MB
    ```
* `progressFrequency` - How often report about processing status?
    
    @defaultValue - 3000ms