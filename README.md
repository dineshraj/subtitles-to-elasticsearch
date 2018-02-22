# Subtitles to ElasticSearch

Takes in an XML subtitle file and posts to AWS Elastic Search in the following format

```
{
  "episodePid": "123456",
  "timecode": "543"
  "text": "some text here"
}
```

## Local script for indexing
[See readme](docs/local-approach.md)

## Lambda approach (not implemented yet)
[See readme](docs/lambda-approach.md)

## Elasticsearch queries
[See readme](docs/elasticstore-info.md)

## Express app to search database
```
PORT=3000 node search_service.js
```

Then use `curl` or similar, for example `curl http://localhost:3000/search?q=great%20britain`
This will return the episode PIDs along with the number of occurrences

Adding an episode PID to the URL will then return timestamps suitable for SMP markers, e.g. `curl http://localhost:3000/search/b09sqvvr?q=great%20britain`
