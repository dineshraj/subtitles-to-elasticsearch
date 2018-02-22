# Key moment markers

Having found some search results, we want to provide easy access to find them within the programme.

This can be done easily with SMP's key moment markers.

For example, after having searched for "Bath University" we might be taken through to this episode:

https://www.bbc.co.uk/iplayer/episode/b09s3gfs/winter-olympics-bbc-one-day-7-womens-skeleton-first-run-and-freestyle-skiing

Run this in the console to get a preview of how it would look:

```javascript
var player = window.embeddedMedia.players[0];
player.setData({
  name: 'SMP.markers',
  data: [
    {
      type: 'key',
      start: 7116,
      text: "taken to the push track at Bath University and thought, this is"
    },
    {
      type: 'key',
      start: 12283,
      text: "at Bath University the British sliders use which is a dry track we"
    }
  ]
});
```
