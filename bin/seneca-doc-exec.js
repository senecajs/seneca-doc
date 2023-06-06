#!/usr/bin/env node

/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const Path = require('path')

var Minimist = require('minimist')

const Inspect = require('../lib/inspect.js')
const Render = require('../lib/render.js')
const Inject = require('../lib/inject.js')

const LocalFolder = process.cwd()
const LocalPackage = require(Path.resolve(LocalFolder, 'package.json'))

const argv = Minimist(process.argv)

inspect_local_plugin()

async function inspect_local_plugin() {
  var extra_plugins = Array.isArray(argv.p)
    ? argv.p
    : 'string' === typeof p
    ? [argv.p]
    : null

  // NOTE: use -t for further top level names
  var top = ['role', 'sys']
    .concat((argv.t || '').split(','))
    .filter(x => '' != x)

  var options = {
    plugins: extra_plugins,
    top: top
  }

  var plugin = await Inspect(LocalFolder, LocalPackage, options)

  // props to ignore
  const ignore_props = [ 'intern' ]
  const re = new RegExp( ignore_props.join('|') )

  var inj = Object.keys(Render).reduce((acc, prop)=>{
    if(!prop.match(re)) {
      acc[prop.replace(/_+/, '-')] = { text: Render[prop](plugin, options) }
    }
    return acc
  }, {})

  Inject.update_file(Path.resolve(LocalFolder, 'README.md'), inj)
}
