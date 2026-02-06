if (!Object.hasOwn) {
  Object.hasOwn = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
  }
}

function structuredClonePolyfill(obj: any): any {
  // Check for special cases for things like Date, Map, Set, etc.
  if (obj === null || typeof obj !== 'object') {
    return obj // primitive types (null, undefined, strings, numbers, booleans, etc.)
  }

  if (obj instanceof Date) {
    return new Date(obj) // Create a new Date object with the same value
  }

  if (obj instanceof Map) {
    const newMap = new Map()
    obj.forEach((value, key) => {
      newMap.set(structuredClonePolyfill(key), structuredClonePolyfill(value))
    })
    return newMap
  }

  if (obj instanceof Set) {
    const newSet = new Set()
    obj.forEach(value => {
      newSet.add(structuredClonePolyfill(value))
    })
    return newSet
  }

  if (obj instanceof ArrayBuffer) {
    return obj.slice(0) // Clone ArrayBuffer
  }

  if (Array.isArray(obj)) {
    return obj.map(item => structuredClonePolyfill(item)) // Recursively clone arrays
  }

  // Handle objects that are not special cases
  const clone: Record<string, any> = {}
  Object.keys(obj).forEach(key => {
    clone[key] = structuredClonePolyfill(obj[key])
  })
  return clone
}

if (!window.structuredClone) {
  Object.defineProperty(window, 'structuredClone', {
    value: structuredClonePolyfill,
    writable: false,
    configurable: false,
    enumerable: false,
  })
}