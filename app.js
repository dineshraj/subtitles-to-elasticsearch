'use strict';

const request = require('request');
const parser = require('xml2json');

// const subtitlesArray = process.argv[2];
const subtitleUri = process.argv[2];

// if (!Array.isArray(subtitlesArray)) {
//   console.log('please provide an array');
//   return;
// }

function stripTagsFromString(string) {
  const stringWithoutTags = string
    .replace(/\<br \/\>/g, ' ')
    .replace(/\<\/?span\w+\>/g, '');

  return stringWithoutTags;
}

// subtitlesArray.forEach((subtitleUri) => {
  request.get(subtitleUri, (err, res, body) => {
    if (err) {
      return console.error('Error', err);
    }

    const subtitleString = stripTagsFromString(body);
    const subtitleJson = parser.toJson(subtitleString);
    const subtitleContents = JSON.parse(subtitleJson).tt.body.div.p;

    subtitleContents.forEach((subtitle) => {
      console.log(timeInSeconds(subtitle.begin));
      console.log(subtitle.$t);
      console.log();
    });
  // });
});

function timeInSeconds(time) {
  let times = time.split(':');
  return parseInt(times[0]) * 60 * 60
    + parseInt(times[1]) * 60
    + parseInt(times[2]);
}
