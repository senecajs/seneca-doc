#!/usr/bin/env node

/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const Path = require('path')

const Inspect = require('../lib/inspect.js')
const Render = require('../lib/render.js')
const Inject = require('../lib/inject.js')

const LocalFolder = process.cwd()
const LocalPackage = require(Path.resolve(LocalFolder, 'package.json'))

inspect_local_plugin()

async function inspect_local_plugin() {
  var plugin = await Inspect(LocalFolder, LocalPackage)
  
  var inj = {
    'action-list': {
      text: Render.action_list(plugin.actions)
    },
    'action-desc': {
      text: Render.action_desc(plugin.actions)
    }
  }
  
  Inject.update_file(Path.resolve(LocalFolder,'README.md'), inj)
}
