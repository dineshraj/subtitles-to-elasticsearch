'use strict';

const request = require('request');
const parser = require('xml2json');

// const subtitlesArray = process.argv[2];
const subtitleUri = process.argv[2];

// if (!Array.isArray(subtitlesArray)) {
//   console.log('please provide an array');
//   return;
// }

const versionPid = /^.+_(\w+)_\d+.xml/.exec(subtitleUri)[1];
console.log("Version PID: " + versionPid);

request({
    url: 'http://www.bbc.co.uk/programmes/' + versionPid,
    followRedirect: false
  }, (err, res, body) => {
    let redirectUrl = res.headers.location.split('/');
    episodePidFound(redirectUrl[redirectUrl.length - 1]);
  });

function episodePidFound(episodePid) {
  console.log("Episode PID: " + episodePid);
}

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
