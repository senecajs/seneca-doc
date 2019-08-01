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
  var extra_plugins = Array.isArray(argv.p) ? argv.p : [argv.p]
  var options = { plugins: extra_plugins }

  var plugin = await Inspect(LocalFolder, LocalPackage, options)

  var inj = {
    'action-list': {
      text: Render.action_list(plugin.actions)
    },
    'action-desc': {
      text: Render.action_desc(plugin.actions)
    }
  }

  Inject.update_file(Path.resolve(LocalFolder, 'README.md'), inj)
}
