"use strict";

function copyHeaders(source, target) {
  for (const [key, value] of Object.entries(source.headers)) {
    try {
      target.header(key, value);
    } catch (e) {
      console.log(`Failed to set header ${key}: ${e.message}`);
    }
  }
}

module.exports = copyHeaders;
