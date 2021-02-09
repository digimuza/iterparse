## XMLReadOptions

- `filePath` - path to file

- `nodeName` - XML node to extract

  ```xml
    <root>
      <Person></Person>
      <Person></Person>
      <Person></Person>
      <Person></Person>
      <Person></Person>
      <Person></Person>
      <Person></Person>
    </root>
  ```

  nodeName to parse is `Person`

- `progress` - Reports about json parsing progress

  ```typescript
  import { xmlRead } from 'iterparse'
  xmlRead({
    filePath: "path/to/file.xml",
    nodeName: "Person",
    progress: (q) => console.log(q.toString()),
  }).count();
  ```

  Logs:

  ```
  File: "../to/file.xml", Progress: 43.12%, Items: 7,651, Speed: 16.71MB/s, ETA: 25.8s, Memory: 91.75MB
  ```

  ```typescript
  xmlRead({
    filePath: "path/to/file.json",
    nodeName: "Person",
    progress: (q) => console.log(q.toJSON()),
  }).count();
  ```

  Logs:

  ```javascript
  {
      eta: 25861.831312410843,
      filePath: "path/to/file.xml",
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

- `progressFrequency` - How often report about processing status?
  @defaultValue - 3000ms


