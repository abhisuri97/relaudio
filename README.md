# Relaud.io - Caption Search for Videos

## The Problem
With a growing amount of video content, it becomes increasingly harder to search within those videos. In addition, many of us want to only see particular parts of the video but don't want to rely on someone's word of mouth to show them a particular part. Many longform videos are poorly annotated, or don't have easily indexable captions. So we find it is really hard to find

- Specific jokes in stand-up comedy routines
- Example problems within posted lectures
- Checking for plagiarism in public addresses
- Step #7 in a DIY project
- The shortcomings of unikernals in a 40 minute talk about unikernals
 
## The Solution
We decided to give people the power to search within videos. Enter a topic or a quote and get back the exact (or closest to exact) phrases that were said. So a frustrating search of scrubbing within the video is no longer. We return the exact time where the quote is being said, along with a video embedded with the timestamp loaded (if it is a YouTube video)

**It's Command -F / Ctrl - F for videos**



## Instructions to Run

Run `npm install` (you may also need to do `npm install -s jquery`.  set `export NODE_ENV=development`. Then run `npm start` in one terminal pane and `node server.js` in the other pane.

Set `export NODE_ENV=production` to run both the server and react app at the same time.
