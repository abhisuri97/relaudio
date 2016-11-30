const rp = require('request-promise');
const utf8 = require('utf8');
const xml2js = require('xml2js-es6-promise');
const clj_fuzzy = require('clj-fuzzy');
function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s); 
}
let errCount = 0
function NoCaptionError(message) {
  this.name = 'NoCaptionError';
  this.message = message || 'No captions for this video';
  this.stock = (new Error()).stack;
}
NoCaptionError.prototype = Object.create(Error.prototype);
NoCaptionError.prototype.constructor = NoCaptionError;

let getSimilarityArr = (vidObj, searchString) => {
  let URL = vidObj.video;
  let options = {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
      'cache-control': 'no-cache'
    },
    url: URL,
  };
  let baseURL = '';

  return rp(options)
  .then( (body) => {
    let s = body.split('TTS_URL')[1];
    let string = s.split(',')[0]
      .split("\"")[1]
    if (string.length === 0) {
      throw new NoCaptionError()
    }
    let test = string.replace(/\\/g, '');
    let base = test.replace(/u0026/g, "&");
    baseURL = base;
    return base
  })
  .then( (base) => {
    let list = base + '&asrs=1&type=list&tangs=1';
    return rp(list)
  })
  .then( (listXML) => {
    return xml2js(listXML)
  })
  .then( (js) => {
    let jsonRes = JSON.parse(JSON.stringify(js))
    let resCapUrls = [];
    for (let i = 0; i < jsonRes.transcript_list.track.length; i++) {
      let currObj = jsonRes.transcript_list.track[i]['$'];
      let obj = {type: '', url: ''};
      let capsUrl = baseURL + '&lang=' + currObj.lang_code +
                              '&type=track' +
                              '&name=' + currObj.name;
      if (currObj.kind === 'asr') {
        capsUrl += '&kind=asr';
        obj.type = 'asr';
      } else {
        obj.type = currObj.lang_code;
      }
      obj.url = capsUrl;
      resCapUrls.push(obj);
    }
    return resCapUrls;
  })
  .then( (arr) => {
    let en_index = -1
    let asr_index = -1
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].type === 'asr') {
        asr_index = i
      } else if (arr[i].type === 'en') {
        en_index = i
      }
    }
    if (en_index > -1) {
      return rp(arr[en_index].url)
    } else if (asr_index > -1) {
      return rp(arr[asr_index].url)
    } else {
      return rp(arr[0].url)
    }
  })
  .then( (transcript) => {
    return xml2js(transcript)
  })
  .then( (jsTranscript) => {
    let jsonStringTranscript = JSON.stringify(jsTranscript);
    let jsonTranscript = JSON.parse(jsonStringTranscript);
    let adjustedTranscript = []
    let tempStr = []
    let tempCounts = []
    jsonTranscript.transcript.text.map( (el, index) => {
      let currStr = el['_'].replace('\n', ' ')
      let wordArr = currStr.split(' ')
      if (tempStr.length > 15) {
        adjustedTranscript.push({
          'text': tempStr.join(' '),
          'timestamp': tempCounts[0]
        });
        tempStr = []
        tempCounts = []
      }
      tempStr = tempStr.concat(wordArr)
      tempCounts.push(el['$'].start)
      return
    });
    let searchCheck = searchString.split(' ');
    adjustedTranscript.map( (el, index) => {
      let splitadjustedTranscript = el.text.split(' ');
      let distSum = splitadjustedTranscript.map( (eladj, indexadj) => {
        let jaccardSum = 0
        searchCheck.map( (srchel, srchindex) => {
          let eladjCp = eladj.replace("/[^a-zA-Z]/g", "")
          let srchelCp = srchel.replace("/[^a-zA-Z]/", "")
          let jaccard = 1 - clj_fuzzy.metrics.jaccard(srchelCp.toUpperCase(), eladjCp.toUpperCase())
          jaccardSum += (jaccard > 0.5) ? jaccard : 0
          if (jaccard > 0.8 || (eladjCp.toUpperCase().indexOf(srchelCp.toUpperCase()) > -1) || (srchelCp.toUpperCase().indexOf(eladjCp.toUpperCase()) > -1) ) {
            jaccardSum += 1
            if (eladjCp.toUpperCase() === srchelCp.toUpperCase()) {
              splitadjustedTranscript[indexadj] = `<b>${eladj}</b>`
            }
          }
        })
        return jaccardSum
      })
      adjustedTranscript[index].text = splitadjustedTranscript.join(' ')
      adjustedTranscript[index].similarity = distSum.reduce( (sum, el) => { return sum + el }, 0)
    })
    let sorted = adjustedTranscript.sort(function(a, b) {
      return b.similarity - a.similarity
    })
    let preboldreslist = sorted.splice(0,5);
    let resarr = []
    preboldreslist.map( (el, index) => {
      let indivresObj = {
        context: `... ${el.text} ...`,
        link: `${URL}&t=${Math.round(el.timestamp)}`,
        timestamp: secondsToHms(Math.round(el.timestamp)),
        similarity: el.similarity
      }
      resarr.push(indivresObj)
    })
    return resarr;
  })
  .then ( (res) => {
    let resVideoObj = Object.assign(vidObj, { 'captions': 'true', 'caption_match': res })
    return resVideoObj;
  })
  .catch(NoCaptionError, function(err) {
    return Object.assign(vidObj, { 
      'captions': 'false',
      'caption_match': 'User chose not to share captions, but this video is relevant to your search regardless'
    })
  })
  .catch(function(err) {
    console.log(err.stack)
    return undefined
  })


}

export default function getSearchRes(searchString, vidString='') {
  console.log(`SEARCHSTRING: ${searchString}, VIDSTRING: ${vidString}`)
  let options = {
    method: 'GET',
    url: 'https://www.googleapis.com/youtube/v3/search',
    qs: {
      part: 'snippet',
      maxResults: '50',
      q: vidString !== '' ? vidString : searchString,
      type: 'video',
      key: 'AIzaSyDoGDOlKCgC_s-AUCb-WqItDSdenFbcTiY'
    },
    headers: {
      'cache-control': 'no-cache'
    }
  }
  return rp(options)
    .then(function(res) {
      let json = JSON.parse(res);
      let allObj = []
      for (let i = 0; i < json.items.length; i++) {
        let currObj = json.items[i]
        let id = currObj.id.videoId
        let thumbnail = currObj.snippet.thumbnails.high.url;
        let title = currObj.snippet.title
        let url = 'https://www.youtube.com/watch?v=' + id
        let vidObj = {
          video: url,
          title: title,
          thumbnail: thumbnail,
          order: i
        }
        allObj.push(vidObj);
      }
      return allObj
    })
    .map(function(vidObj) {
      return getSimilarityArr(vidObj, searchString)
    })
    .then(function(resNotSorted) {
      let resWithNulls = resNotSorted.sort(function(a,b) {
        let arrA = a.captions === 'true' && a.caption_match.length > 0 ? a.caption_match[0].similarity : 0
        let arrB = b.captions === 'true' && b.caption_match.length > 0 ? b.caption_match[0].similarity : 0
        return arrB - arrA
      })
      let res = resWithNulls.filter( (index) => { return typeof(index) !== 'undefined' && index.caption_match.length > 0} )
      return res
    })
    .catch(function(err) {
      return 'There was a mysterious error :/'
    })
}
