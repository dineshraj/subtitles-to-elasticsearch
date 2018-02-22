'use strict';

const request = require('request');
const parser = require('xml2json');
const fs = require('fs');

const AWS = require('aws-sdk');
const connectionClass = require('http-aws-es');
const elasticsearch = require('elasticsearch');

const subtitleLocationsFile = process.argv[2];

AWS.config.update({
  region: 'eu-west-1',
  accessKeyId: process.argv[3],
  secretAccessKey: process.argv[4]
});

function configureEsClient() {
  return new elasticsearch.Client({
    host: 'https://search-test-subtitles-store-lfbgr2ddndtyd2gqjcn35buicu.eu-west-1.es.amazonaws.com/',
    log: 'error',
    connectionClass: connectionClass,
    amazonES: {
      credentials: new AWS.EnvironmentCredentials('AWS')
    }
  });
}

function getEpisodePid(versionPid) {
  return new Promise((resolve, reject) => {
    request({
      url: `http://www.bbc.co.uk/programmes/${versionPid}`,
      followRedirect: false
    }, (err, res, body) => {
      if (err) {
        reject(err);
        return;
      }
      const redirectUrlArray = res.headers.location.split('/');
      const episodePid = redirectUrlArray[redirectUrlArray.length - 1];

      resolve(episodePid);
    });
  });
}

function formatSubtitleDataForEs(rawSubtitleData, episodePid) {
  const subtitleString = stripTagsFromString(rawSubtitleData);
  const subtitleJson = parser.toJson(subtitleString);
  const subtitleContents = JSON.parse(subtitleJson).tt.body.div.p;
  let esSubtitleDataArray = [];

  subtitleContents.forEach((subtitleObject) => {
    esSubtitleDataArray.push({
      index: {
        _index: 'subtitles',
        _type: 'subtitle'
      }
    });
    esSubtitleDataArray.push({
      text: subtitleObject.$t,
      timecode: timeInSeconds(subtitleObject.begin),
      episodePid: episodePid
    });
  });

  return esSubtitleDataArray;
}

function sendSubtitleDataToEs(formattedSubtitleData, elasticClient) {
  elasticClient.bulk({
    body: formattedSubtitleData
  }, (err, resp) => {
    if (err) {
      console.error('error:', err);
    }
  });
}

function stripTagsFromString(string) {
  const stringWithoutTags = string
    .replace(/\<br\s*\/\>/g, ' ')
    .replace(/\<\/?span[\w\s=:"]*\>/g, '');

  return stringWithoutTags;
}

function timeInSeconds(time) {
  const times = time.split(':');
  const hoursInSeconds = parseInt(times[0]) * 60 * 60;
  const minutesinSeconds = parseInt(times[1]) * 60;
  const seconds = parseInt(times[2]);

  return hoursInSeconds + minutesinSeconds + seconds;
}

function requestAndProcessSubtitle(subtitleUri) {
  request.get(subtitleUri, (err, res, body) => {
    if (err) {
      return console.error('error:', err);
    }
    const versionPid = /^.+_(\w+)_\d+.xml/.exec(subtitleUri)[1];
    getEpisodePid(versionPid).then((episodePid) => {
      const formattedSubtitleData = formatSubtitleDataForEs(body, episodePid);
      const elasticClient = configureEsClient();
      sendSubtitleDataToEs(formattedSubtitleData);
    });
  });
}

fs.readFile(subtitleLocationsFile, 'utf8', (err, contents) => {
  if (err) {
    console.error(err);
  }

  const fileContentsInJson = JSON.parse(contents);

  fileContentsInJson.subtitleUrls.forEach((subtitleUrl) => {
    requestAndProcessSubtitle(subtitleUrl);
  });
});
