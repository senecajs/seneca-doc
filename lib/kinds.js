/* Copyright (c) 2026 Voxgig Ltd. and other contributors, MIT License */
'use strict'

// Recognise validation values by their markers, without loading the
// libraries that made them. A shape or node can come from the copy of
// `shape` inside the Seneca of the documented project, and a Joi schema
// from the plugin's own Joi dependency.

const SHAPE$ = Symbol.for('shape$')
const JOI$ = Symbol.for('@hapi/joi/schema')

module.exports = {
  // A compiled shape, such as `seneca.valid({ a: 1 })`.
  is_shape: function(v) {
    return (
      'function' === typeof v &&
      null != v.shape &&
      SHAPE$ === v.shape.shape$ &&
      'function' === typeof v.spec
    )
  },

  // A shape node, such as `seneca.valid.Required(String)`, an element of
  // `shape.node().v`, or of `shape.spec().v` (where the marker is `true`).
  is_shape_node: function(v) {
    return (
      null != v &&
      'object' === typeof v &&
      null != v.$ &&
      (SHAPE$ === v.$.shape$ || true === v.$.shape$) &&
      'string' === typeof v.t
    )
  },

  // A Joi schema (joi or @hapi/joi 16 and later, or an older Joi).
  is_joi: function(v) {
    return (
      null != v &&
      'object' === typeof v &&
      (!!v[JOI$] || true === v.isJoi) &&
      'function' === typeof v.describe
    )
  }
}
