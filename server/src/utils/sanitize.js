const sanitizeHtml = require('sanitize-html');

function cleanText(value) {
  return sanitizeHtml(String(value || ''), {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
}

module.exports = { cleanText };
