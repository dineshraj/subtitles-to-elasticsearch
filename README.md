# subtitles-to-elasticsearch

Takes in an array of XML subtitle files and posts to Elastic Search in the following format

```
{
  "pid": "123456",
  "timecode": "543"
  "text": "some text here"
}
```
