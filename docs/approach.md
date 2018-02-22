# Subtitle searching

Output from the Topic that will be processed by our lambda:  
```json
{
    "activity_id": "ae2e59b1-6f92-4e33-b143-9fe27f0766aa",
    "action": "insert",
    "user_properties": {
        "master_brand_id": "bbc_one",
        "version_pid": "b09srqq5",
        "media_asset_basepath": "iplayer/subtitles",
        "head_check_locations": "http://www.bbc.co.uk/iplayer/subtitles/ng/modav/bUnknown-ae2e59b1-6f92-4e33-b143-9fe27f0766aa_b09srqq5_1518533432428.xml",
        "drm_type": "none",
        "profile": "xml_ttml",
        "distributed": "true",
        "head_check_timeout": "1518555032",
        "media_asset_filename": "ng/modav/bUnknown-ae2e59b1-6f92-4e33-b143-9fe27f0766aa_b09srqq5_1518533432428.xml",
        "media_duration_milliseconds": "1000",
        "media_asset_profile_pid": "p00m2t9g",
        "media_asset_profile_id": "s_od_p001",
        "workflow_source": "fbd"
    },
    "payload": {
        "content_version_id": "pips-pid-b09srqq5",
        "drm": "none",
        "media_asset_id": "pips-pid-p05y16jf",
        "sequence_stamp": 1518533442001000,
        "profile_id": "pips-map_id-s_od_p001",
        "relative_file_path": "ng/modav/bUnknown-ae2e59b1-6f92-4e33-b143-9fe27f0766aa_b09srqq5_1518533432428.xml",
        "uri": "s3://livemodavsharedresources-publ!
        icstaticbucket - 16 n1nhlyoptzf / iplayer / subtitles / ng / modav / bUnknown - ae2e59b1 - 6 f92 - 4e33 - b143 - 9 fe27f0766aa_b09srqq5_1518533432428.xml ","
        size ":59249}}
    }
}
```

## Arns

Topic ARN:  
`arn:aws:sns:eu-west-1:240129357028:LiveModavMamiResources-PublishOutTopic-1S7GSKFHW4M8`

Lambda ARN:  
`arn:aws:lambda:eu-west-1:038610054328:function:helloWorld`

Role ARN:  
`arn:aws:iam::038610054328:role/lambda-sns-modav-development`

## Setting up permissions

Guide for account permissions:
https://docs.aws.amazon.com/lambda/latest/dg/with-sns-create-x-account-permissions.html

**Command for adding Lambda access from the topic to the lambda .**
```bash
with-aws bbc-production aws sns add-permission \
  --region eu-west-1 \
  --topic-arn arn:aws:sns:eu-west-1:240129357028:LiveModavMamiResources-PublishOutTopic-1S7GSKFHW4M8 \
  --label lambda-access \
  --aws-account-id 038610054328 \
  --action-name Subscribe ListSubscriptionsByTopic Receive
```
**Give Lambda permission to allow invocation from SNS**
```bash
with-aws modav-development aws lambda add-permission \
  --function-name helloWorld \
  --statement-id sns-x-account \
  --action "lambda:InvokeFunction" \
  --principal sns.amazonaws.com \
  --source-arn arn:aws:sns:eu-west-1:240129357028:LiveModavMamiResources-PublishOutTopic-1S7GSKFHW4M8`
```
Response for above:
```json
{
  "Statement": "{\"Sid\":\"sns-x-account\",\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"sns.amazonaws.com\"},\"Action\":\"lambda:InvokeFunction\",\"Resource\":\"arn:aws:lambda:eu-west-1:038610054328:function:helloWorld\",\"Condition\":{\"ArnLike\":{\"AWS:SourceArn\":\"arn:aws:sns:eu-west-1:240129357028:LiveModavMamiResources-PublishOutTopic-1S7GSKFHW4M8\"}}}"
}
```

**Command to subscribe lambada to topic:**
```bash
with-aws modav-development aws sns subscribe \
  --topic-arn arn:aws:sns:eu-west-1:240129357028:LiveModavMamiResources-PublishOutTopic-1S7GSKFHW4M8 \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:eu-west-1:038610054328:function:helloWorld
```

Response from above:
```json
{
  "SubscriptionArn": "arn:aws:sns:eu-west-1:240129357028:LiveModavMamiResources-PublishOutTopic-1S7GSKFHW4M8:e801cb4d-a75c-4913-8308-4b59afe39c47"
}
```

This might be useful as an example of getting things from S3 and pushing to ES:
https://github.com/awslabs/amazon-elasticsearch-lambda-samples/blob/master/src/s3_lambda_es.js


## Steps in lambda function

- get vPid: `event.user_properties.version_pid`
- get ePid: `curl -I www.bbc.co.uk/programmes/$vpid` (find node alternative) and get returned `Location`
- get subtitle file from `event.user_properties.head_check_locations`
- mangle subtitle file into appropriate JSON format (potential example below)
 - As part of this, change timecode into `1h4m55s` format for iPlayer `#t=1h4m55s` format
- push data to ElasticSearch

### Potential data structure

A possible sample document to add into the ES and see if we can search it usefully:

```json
{
  "episode-pid": "b09rbtsb",
  "subtitles": [
    {
      "timecode": "5m48s",
      "text": "There are some places on Earth..."
    },
    {
      "timecode": "10m44s",
      "text": "..that simply take your breath away."
    },
    {
      "timecode": "16m56s",
      "text": "Lush tropical forests."
    },
    {
      "timecode": "20m64s",
      "text": "Spectacular islands."
    },
    {
      "timecode": "26m24s",
      "text": "Soaring mountain ranges."
    },
    {
      "timecode": "38m24s",
      "text": "And for the people who call these extraordinary places home..."
    }
  ]
}
```

## ElasticSearch integration

Requests have to be in form of `http://localhost:9200/<index>/<type>/<id>` (where `id` is optional)

### Useful cli commands

```bash
curl -XPUT "http://localhost:9200/episodes/episode/123457" -H 'Content-Type: application/json' -d'
{
  "subtitles": [{
    "timecode": "0m10s",
    "text": "tower of london was built ages ago"
  },
  {
    "timecode": "3m18s",
    "text": "I love the tower of london"
  },
  {
    "timecode": "5m18s",
    "text": "this is nothing"
  }]
}'
```
