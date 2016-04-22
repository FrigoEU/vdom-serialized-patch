var patchRecursive = require('./patchRecursive');

function patch(rootNode, patches, makeHandler) {
  return patchRecursive(rootNode, patches, makeHandler);
}

module.exports = patch;
