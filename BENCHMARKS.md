# Benchmarks


## CSV

Paring 5 million records of sales data. 
[Sample.csv (111.96MB) ](http://eforexcel.com/wp/wp-content/uploads/2020/09/5m-Sales-Records.7z)

Test was executed on `AMD 2600x` processor

You can check benchmark source code [here](https://github.com/digimuza/iterparse/blob/master/benchmarks/src/csv/bench.ts).

<div style="height: 500px; background: transparent;">
    <div style="width: 20%; background: rgb(250, 140, 22); padding: 5px; margin-bottom: 20px"><h3 style="color: white">csv-parser - 24.1 s<h3></div>
    <div style="width: 20.9%; background: rgb(250, 140, 22); padding: 5px; margin-bottom: 20px"><h3 style="color: white">iterparse - 23.9 s<h3></div>
    <div style="width: 100%; background: rgb(250, 140, 22); padding: 5px;"><h3 style="color: white">fast-csv - 119.8 s<h3></div>
</div>


## XML

Parsing 1 million records of random generated data. 
Data was generated using `yarn generate-xml` command. Source code [here]()

Test was executed on `AMD 2600x` processor

You can check benchmark source code [here](https://github.com/digimuza/iterparse/blob/master/benchmarks/src/xml/bench.ts).

<div style="height: 500px; background: transparent;">
    <div style="width: 100%; background: rgb(250, 140, 22); padding: 5px; margin-bottom: 20px"><h3 style="color: white">xml-stream - 3m 23s<h3></div>
    <div style="width: 13%; background: rgb(250, 140, 22); padding: 5px; margin-bottom: 20px"><h3 style="color: white">iterparse - 27 s<h3></div>
</div>


## JSON

Parsing 1 million records of random generated data. 
Data was generated using `yarn generate-json` command. Source code [here]()

Test was executed on `AMD 2600x` processor

You can check benchmark source code [here](https://github.com/digimuza/iterparse/blob/master/benchmarks/src/json/bench.ts).

Currently iterparse is only contender. Because it already uses JSONStream package i can't put it here

<div style="height: 500px; background: transparent;">
    <div style="width: 100%; background: rgb(250, 140, 22); padding: 5px; margin-bottom: 20px"><h3 style="color: white">iterparse - 23 s<h3></div>
</div>