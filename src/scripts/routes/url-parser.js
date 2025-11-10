// src/scripts/routes/url-parser.js

const UrlParser = {
  parseActiveUrlWithCombiner() {
    // Ambil hash tanpa tanda #
    let url = window.location.hash.slice(1).toLowerCase();

    // Potong query string agar router tetap cocok
    const urlWithoutQuery = url.split('?')[0];

    const splitedUrl = this._urlSplitter(urlWithoutQuery);
    return this._urlCombiner(splitedUrl);
  },

  parseActiveUrlWithoutCombiner() {
    let url = window.location.hash.slice(1).toLowerCase();

    // Tetap potong query string
    const urlWithoutQuery = url.split('?')[0];

    return this._urlSplitter(urlWithoutQuery);
  },

  _urlSplitter(url) {
    const urls = url.split('/');
    return {
      resource: urls[1] || null,
      id: urls[2] || null,
      verb: urls[3] || null,
    };
  },

  _urlCombiner(splitedUrl) {
    return (splitedUrl.resource ? `/${splitedUrl.resource}` : '/') +
      (splitedUrl.id ? '/:id' : '') +
      (splitedUrl.verb ? `/${splitedUrl.verb}` : '');
  },
};

export default UrlParser;
