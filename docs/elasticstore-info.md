# Reading and writing to the database

The database is available at https://search-test-subtitles-store-lfbgr2ddndtyd2gqjcn35buicu.eu-west-1.es.amazonaws.com/

The first important thing to do is make `episodePid` a keyword field. This is so that we can do aggregations on the data.

```bash
curl -XPUT 'https://search-test-subtitles-store-lfbgr2ddndtyd2gqjcn35buicu.eu-west-1.es.amazonaws.com/subtitles?pretty' -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "subtitle": {
      "properties": {
        "episodePid": {
          "type":  "keyword"
        }
      }
    }
  }
}
'
```

## Searching the data

This searches for a keyword, aggregating by `episodePid`:

```bash
curl -XGET 'https://search-test-subtitles-store-lfbgr2ddndtyd2gqjcn35buicu.eu-west-1.es.amazonaws.com/subtitles/subtitle/_search?pretty' -H 'Content-Type: application/json' -d'
{
    "query" : {
        "match" : {
            "text" : "London"
        }
    },
    "aggs" : {
        "by_episode" : {
            "terms" : {
              "field" : "episodePid"
            }
        }
    }
}
'
```

Given an `episodePid`, you can find the subtitles that match the keyword:

```bash
curl -XGET 'https://search-test-subtitles-store-lfbgr2ddndtyd2gqjcn35buicu.eu-west-1.es.amazonaws.com/subtitles/subtitle/_search?pretty' -H 'Content-Type: application/json' -d'
{
    "query": {
        "bool" : {
            "must" : {
                "match" : {
                    "text" : "London"
                }
            },
            "filter" : {
                "term" : { "episode" : "b09rbtsb" }
            }
        }
    }
}
'
```
