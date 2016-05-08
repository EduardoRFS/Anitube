const express = require('express');
const cheerio = $ = require('cheerio');
const request =  require('request-promise').defaults({ 'proxy': 'http://107.191.61.141:3128' });
const url = require('url');
const path = require('path');

const app = express();

const ANITUBE = 'http://www.anitube.se';
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);


app.use(express.static(path.join(__dirname, 'public')));

let cache = {};
function autoParse(body, response, resolveWithFullResponse) {
  // FIXME: The content type string could contain additional values like the charset.
  let type = response.headers['content-type'];
  if (type && type.indexOf('text/html') > -1) {
    return cheerio.load(body);
  } else {
    return body;
  }
}

async function getPage (originalUrl) {
  let body = await request.get({
    url: ANITUBE + originalUrl,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.7 Safari/537.36'
    },
    transform: autoParse
  });
  if (typeof body == 'string') return body;
  body('a').map(function (i, link) {
    let href = $(link).attr('href');
    if (!href) return;
    href = url.parse(href);
    href.host = 'localhost:3000';
    $(link).attr('href', url.format(href));
  });
  body('script').map((i, link) => {
    let src = $(link).attr('src');
    if (!src) return;
    if (src.indexOf('adingo.jp') > -1 || src.indexOf("anigrupo") > -1) {
      console.log(src);
      $(link).remove();
      return;
    }
    if (src.indexOf('anitubeJWOverlay.js') > -1) {
      $(link).attr('src', '/anitubeJWOverlay.js');
      return;
    }
    src = url.parse(src);
    if (!src.host) return;

    if (src.host.startsWith('www.anitube'))
      src.host = 'localhost:3000';
    $(link).attr('src', url.format(src));
  });
  return body.html();
}

app.use(wrap(async (req, res) => {
  let originalUrl = req.originalUrl;
  if (!cache[originalUrl]) {
    cache[originalUrl] = await getPage(originalUrl);
  }
  res.send(cache[originalUrl]);
  let body = await request.get({
    url: ANITUBE + req.originalUrl,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.7 Safari/537.36'
    },
    transform: autoParse
  });
  //let body = await request(url);
  //console.log(body);
}));

/*const request = require('request');
const r = request.defaults({ 'proxy': 'http://107.191.61.141:3128' });

(async () => {
  r.get('http://www.anitube.se', (err,httpResponse,body) => {
    console.log(body);
  });
})();*/

app.listen(3000);