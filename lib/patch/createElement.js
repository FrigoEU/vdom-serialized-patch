var applyProperties = require("./applyProperties")
var isVText = require('./isVText');
var isVNode = require('./isVNode');

module.exports = createElement;

function createElement(vnode, makeHandler) {
  var doc = document;

  if (isVText(vnode)) {
    return doc.createTextNode(vnode.x) // 'x' means 'text'
  } else if (!isVNode(vnode)) {
    return null
  }

  var node = (!vnode.n) ? // 'n' === 'namespace'
    doc.createElement(vnode.tn) : // 'tn' === 'tagName'
    doc.createElementNS(vnode.n, vnode.tn)

  var props = vnode.p // 'p' === 'properties'
  applyProperties(node, props, null, makeHandler)

  var children = vnode.c // 'c' === 'children'

  if (children) {
    for (var i = 0; i < children.length; i++) {
      var childNode = createElement(children[i], makeHandler)
      if (childNode) {
        node.appendChild(childNode)
      }
    }
  }

  return node
}
