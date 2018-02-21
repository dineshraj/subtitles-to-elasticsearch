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
    .replace(/\<br\s*\/\>/g, ' ')
    .replace(/\<\/?span[\w\s=:"]*\>/g, '');

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

    console.log(subtitleContents);
  // });
});
