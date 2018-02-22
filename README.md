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
