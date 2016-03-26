var patchTypes = require('../patchTypes');
var toJson = require('vdom-as-json/toJson');

// traverse the thing that the original patch structure called "a',
// i.e. the virtual tree representing the current node structure.
// this thing only really needs two properties - "children" and "count",
// so trim out everything else
function serializeCurrentNode(currentNode) {
  var children = currentNode.children;
  if (!children) {
    return null;
  }
  var len = children.length;
  var arr = new Array(len);
  var i = -1;
  while (++i < len) {
    arr[i] = serializeCurrentNode(children[i]);
  }
  if (currentNode.count) {
    return [arr, currentNode.count];
  } else {
    return [arr];
  }
}

function serializeVirtualPatchOrPatches(vPatch, serializeFunction) {
  if (Array.isArray(vPatch)) {
    var len = vPatch.length;
    var res = new Array(len);
    var i = -1;
    while (++i < len) {
      res[i] = serializeVirtualPatch(vPatch[i], serializeFunction);
    }
    return res;
  }
  return [serializeVirtualPatch(vPatch, serializeFunction)];
}

function serializeVirtualPatch(vPatch, serializeFunction) {
  var type = vPatch.type;
  var res = [
    type,
    vPatch.patch && vPatch.patch.a ? toJson(serializeRootPatch(vPatch.patch, serializeFunction), serializeFunction) : toJson(vPatch.patch, serializeFunction)
  ];

  if (type === patchTypes.PROPS) {
    // this is the only time the vNode is needed
    res.push({p: vPatch.vNode.properties}); // 'p' === 'properties'
  }
  return res;
}

function serializeRootPatch(patch, serializeFunction) {
  var outputRootNode = serializeCurrentNode(patch.a, serializeFunction);

  var res = {
    a: outputRootNode
  };

  for (var key in patch) {
    if (key !== 'a') {
      res[key] = serializeVirtualPatchOrPatches(patch[key], serializeFunction);
    }
  }

  return res;
};
module.exports = serializeRootPatch;
