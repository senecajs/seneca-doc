/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

var Util = require('util')

module.exports = {
  action_list: function (list) {
    const b = ['\n\n## Action Patterns\n']

    list.forEach((x)=>{
      b.push('* ['+x.pattern+'](#'+intern.patlink(x.pattern)+')')
    })

    return b.join('\n')+'\n\n'
  },

  action_desc: function (list) {
    const b = ['\n\n## Action Descriptions\n']

    list.forEach((x)=>{
      b.push('### &laquo; `'+x.pattern+'` &raquo;\n')
      b.push(x.desc+'\n\n')

      b.push(intern.action_params(x.rules))
    })

    return b.join('\n')+'\n\n'
    
  }

}


const intern = (module.exports.intern = {
  action_params: function(rules) {
    const b = ['#### Parameters\n\n']
    const params = Object.keys(rules)

    if( 0 === params.length ) {
      b.push('_No parameters defined (use seneca-joi to do this)._')
    }
    else {
      params.forEach(function(param) {
        var rule = rules[param]
        var param_md = '* _'+param+'_: '
        if(rule.isJoi) {
          b.push(param_md +
                 rule._type
                )
        }
        else {
          b.push(param_md + Util.inspect(rule))
        }
      })
    }
    return b.join('\n')+'\n\n'
  },

  patlink: function(pat) {
    return '-'+pat.replace(/[^\w]/g,'')+'-'
  }
})
