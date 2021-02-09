## DownloadOptions

Download option are extended have same options as `RequestInit`

[RequestInit](https://www.npmjs.com/package/node-fetch#options) options

* `url` - link to file

* `downloadFolder` - path where downloaded content will be stored

* `resourceId` - How to generate resource id?
    Download function have special behavior where it tries to prevent multiple downloads if possible. 
    
    This function achieve this by executing request and checking response headers. Most likely headers will have `etag` or `last-modified` values.
    If this happen generated `resourceId` will be `hash(etag) | hash(last-modified)` 

    If these values are not present. Resource id will be `hash(${date.toDateString()}:${date.getHours()})` this will cache file for maximum 1 hour

    Examples
    ```typescript
    // Will download file once.
    download({
        url: "url/to/resource.json",
        resourceId: "example"
    })
    .count()
    ```
    ```typescript
    // Will download file always.
    download({
        url: "url/to/resource.json",
        resourceId: false
    })
    .count()
    ```

    ```typescript
    // Will download file every at least 24 hours.
    download({
        url: "url/to/resource.json",
        resourceId: new Date().toDateString()
    })
    .count()
    ```

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
    