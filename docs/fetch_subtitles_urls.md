# Getting subtitle URL locations

Given a TLEO, you can run a script to find the locations of subtitles URLs for programmes in that TLEO.

You will need to query the PIPs API, so for this you must export a PEM_FILE which is your developer certificate.

Then run the rake task, giving a TLEO.

```bash
cd scripts
export PEM_FILE=/path/to/your/dev-cert.pem
rake get_subtitles_urls_for_tleo b00qfb83
```

A JSON file will be produced, called `subtitles_b00qfb83.json`