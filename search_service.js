var elasticsearch = require('elasticsearch');
var express = require('express');
var app = express();

var port = process.env.PORT || 3000;
var query = process.argv[2];
var episodePid = process.argv[3];

var CLIENT = new elasticsearch.Client({
  host: 'https://search-test-subtitles-store-lfbgr2ddndtyd2gqjcn35buicu.eu-west-1.es.amazonaws.com',
  // log: 'trace'
});

function searchForEpisodes(query) {
  return new Promise(function (resolve, reject) {
    CLIENT.search({
      index: 'subtitles',
      type: 'subtitle',
      body: {
        query: {
          match: {
            text: query
          }
        },
        aggs: {
          by_episode: {
            terms: {
              field: "episodePid"
            }
          }
        }
      }
    }).then(function (resp) {
      var aggregates = resp.aggregations.by_episode.buckets;
      var urls = aggregates.map(result => {
        return {
          url: `https://www.bbc.co.uk/iplayer/episode/${result.key}/?search=${encodeURIComponent(query)}`,
          episodePid: result.key,
          occurrences: result.doc_count
        }
      })
      resolve(urls);
    }, function (err) {
      console.trace(err.message);
    })
  });
}

function searchEpisodeForPhrase(episodePid, query) {
  return new Promise(function (resolve, reject) {
    CLIENT.search({
      index: 'subtitles',
      type: 'subtitle',
      body: {
        query: {
          bool: {
            must: {
              match: {
                text: query
              }
            },
            filter: {
              term: {
                episodePid: episodePid
              }
            }
            
          }
        }
      }
    }).then(function (resp) {
      var hits = resp.hits.hits;
      var output = hits.map(hit => {
        return {
          type: 'key',
          start: hit._source.timecode,
          text: hit._source.text
        };
      });
      resolve(output);
    })
  })
}

app.get('/search/:episodePid', function(req, response) {
  const query = req.query.q;
  const episodePid = req.params.episodePid;
  searchEpisodeForPhrase(episodePid, query).then(results => {
    console.log('go there')
    console.log(`https://www.bbc.co.uk/iplayer/episode/${episodePid}/\n`)
    console.log('paste that')
    console.log(`var player = window.embeddedMedia.players[0];
  player.setData({
    name: 'SMP.markers',
    data: ${JSON.stringify(results)}
  });\n`)
  console.log('sorted.\n')
    response.send(results)
  });
})

app.get('/search', function(req, response) {
  const query = req.query.q;
  searchForEpisodes(query).then(results => response.send(results));
})

app.listen(3000);
console.log('should be listening on port 3000')

if (episodePid) {
  searchEpisodeForPhrase(episodePid, query).then(results => console.log(`var player = window.embeddedMedia.players[0];
  player.setData({
    name: 'SMP.markers',
    data: ${JSON.stringify(results)}
  });`));
} else if (query) {
  searchForEpisodes(query).then(results => console.log(results));
}