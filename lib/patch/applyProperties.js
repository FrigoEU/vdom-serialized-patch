var isObject = require('./isObject');
var isSoftSetHook = require('./isSoftSetHook');

module.exports = applyProperties;

function isHook(hook) {
  return hook &&
    (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
     typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

function applyProperties(node, props, previous, makeHandler) {
  for (var propName in props) {
    var propValue = props[propName];
    if (propValue && propValue.substr && propValue.substr(0, 14) === "_vdom_as_json_"){
      propValue = makeHandler(propValue.substr(14))
    }

    if (propValue === undefined) {
      removeProperty(node, propName, previous);
    } else if (isSoftSetHook(propValue)) {
      removeProperty(node, propName, propValue, previous)
      node[propName] = propValue.value
    } else if(isHook(propValue)){
      removeProperty(node, propName, propValue, previous)
      if (propValue.hook) {
        propValue.hook(node,
                       propName,
                       previous ? previous[propName] : undefined)
      }
    } else {
      if (isObject(propValue)) {
        patchObject(node, props, previous, propName, propValue);
      } else {
        node[propName] = propValue;
      }
    }
  }
}

function removeProperty(node, propName, previous) {
  if (!previous) {
    return
  }
  var previousValue = previous[propName]

  if (!isHook(previousValue)) {
    if (propName === "attributes") {
      for (var attrName in previousValue) {
        node.removeAttribute(attrName)
      }
    } else if (propName === "style") {
      for (var i in previousValue) {
        node.style[i] = ""
      }
    } else if (typeof previousValue === "string") {
      node[propName] = ""
    } else {
      node[propName] = null
    }
  } else if (previousValue.unhook) {
    previousValue.unhook(node, propName, propValue)
  }
}

function patchObject(node, props, previous, propName, propValue) {
  var previousValue = previous ? previous[propName] : undefined

  // Set attributes
  if (propName === "attributes") {
    for (var attrName in propValue) {
      var attrValue = propValue[attrName]

      if (attrValue === undefined) {
        node.removeAttribute(attrName)
      } else {
        node.setAttribute(attrName, attrValue)
      }
    }

    return
  }

  if (previousValue && isObject(previousValue) &&
    getPrototype(previousValue) !== getPrototype(propValue)) {
    node[propName] = propValue
    return
  }

  if (!isObject(node[propName])) {
    node[propName] = {}
  }

  var replacer = propName === "style" ? "" : undefined

  for (var k in propValue) {
    var value = propValue[k]
    node[propName][k] = (value === undefined) ? replacer : value
  }
}

function getPrototype(value) {
  // getPrototypeOf shim for older browsers
  /* istanbul ignore else */
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else {
    return value.__proto__ || value.constructor.prototype;
  }
}
