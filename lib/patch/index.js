var patchRecursive = require('./patchRecursive');

function patch(rootNode, patches) {
  return patchRecursive(rootNode, patches, makeHandler);
}

module.exports = patch;
