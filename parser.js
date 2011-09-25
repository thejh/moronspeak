exports.parse = parse
exports.compile = compile

var globalRules =
// "define x as native expression y."
[ { tokens:
    [ {type: 'symbol', value: 'define'}
    , {type: 'expr', name: 'grammar'}
    , {type: 'symbol', value: 'as'}
    , {type: 'symbol', value: 'native'}
    , {type: 'symbol', value: 'expression'}
    , {type: 'expr', name: 'js_body'}
    , {type: 'symbol', value: '.'}
    ]
  , resultType: 'stat'
  , immediately: function(rules, opts) {
      var self = this
      console.log('DBG: '+opts[0].value+','+opts[1].value)
      var tokens = opts[0].value.split(' ').map(function(grammarPart) {
        if (grammarPart[0] === '$')
          return {type: 'expr', name: grammarPart}
        else
          return {type: 'symbol', value: grammarPart}
      })
      function compile(opts) {
        opts = opts.map(function(option) {
          return option.compile ? option.compile(option.opts) : option.value
        }).join(', ')
        return self.fnname+'('+opts+')'
      }
      rules.push({tokens: tokens, resultType: 'expr', compile: compile})
    }
  , compile: function(opts) {
      var grammar = opts[0]
        , js_body = opts[1]
      this.fnname = grammar.value.replace(/ /g, '_')
      grammar = grammar.value.split(' ')
      var fnargs = grammar.filter(function(token){return token[0]==='$'})
      return 'var '+this.fnname+' = function('+fnargs.join(', ')+') { return '+js_body.value+' };\n'
    }
  }
]

function parse(tokens) {
  tokens = tokens.concat()
  var parserState = []
    , rules = globalRules.concat()
  
  function shift() {
    parserState.push(tokens.shift())
  }
  
  function attemptReduce() {
    // for each grammar entry, look whether types and keywords match the end of
    // the parser state
    var matchingRules = rules.filter(function(rule) {
      if (rule.tokens.length > parserState.length) return false
      var parserStateEnd = parserState.slice(parserState.length - rule.tokens.length)
      for (var i=0; i<parserStateEnd.length; i++) {
        var neededToken = rule.tokens[i]
          , actualToken = parserStateEnd[i]
        if (neededToken.type === 'symbol') {
          if (actualToken.type !== 'name' && actualToken.type !== 'symbol') return false
          if (actualToken.value !== neededToken.value) return false
        } else {
          if (actualToken.type !== neededToken.type && (neededToken.type !== 'expr'
              || ['string', 'number'].indexOf(actualToken.type) === -1)) return false
        }
      }
      return true
    })
    if (matchingRules.length !== 1) return false
    var rule = matchingRules[0]
    var expectedTokens = rule.tokens.concat()
    var args = []
    while (expectedTokens.length) {
      var expected = expectedTokens.pop()
      var actual = parserState.pop()
      if (expected.type !== 'symbol') {
        //args[expected.name] = actual
        args.unshift(actual)
      }
    }
    var newToken =
    { compile: rule.compile
    , type: rule.resultType
    , opts: args
    }
    if (rule.immediately) rule.immediately.call(newToken, rules, args)
    parserState.push(newToken)
    return true
  }
  
  while (tokens.length) {
    shift()
    while (attemptReduce());
  }
  return parserState
}

function compile(nodes) {
  console.log('compiling!')
  return nodes.map(function(node) {
    console.log('node properties: '+Object.keys(node).join(','))
    if (node.compile)
      return node.compile(node.opts)
    else
      return node.value
  }).join(';\n')
}
