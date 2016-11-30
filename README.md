# Relaud.io - Caption Search for Videos

## API Routes

### POST Routes

`api/search/:param` 

Expects `param` to be a string of the search term. If `"param"` then return matches with exact match must be returned.

Response (array):

```
[
  { 
    video: "http://url-of-the-video.com",
    title: "title of the video",
    description: "string of the description of the video",
    thumbnail: "http://url-of-the-thumbnail-image.com",
    author: "String of author of the video",
    author_link: "http://url-of-the-authors-youtube-page",
    length: "Length of the video in HH:MM:SS",
    caption_match: [
      {
        context: "... string of context with <b> bolded matches </b> ...",
        link: "http://url-to-the-video-at-match-point.com",
        timestamp: "Timestamp of match in HH:MM:SS"
      },
      ...
    ]
  },
  ...
]
```

## Instructions to Run

Run `npm install` (you may also need to do `npm install -s jquery`.  set `export NODE_ENV=development`. Then run `npm start` in one terminal pane and `node server.js` in the other pane.

Set `export NODE_ENV=production` to run both the server and react app at the same time (but be wary since the compile process is rather slow. 
