#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');

var meow = require('meow');
var chalk = require('chalk');
var pkg = require('../package.json');
var file = require('./file');
var utils = require('./utils');
var buildDepsGraph = require('./deps-graph');

var cli = meow({
  help: ['Usage', '  $ br ./test[.sh]', '', 'Options', '  --output  Specify output file directory', '  --watch   Watch for changes in required files and rebuild on the fly', '', 'version: ' + pkg.version],
  alias: {
    i: 'input',
    o: 'output'
  }
});

var entry = cli.flags.input;
var outdir = cli.flags.output || path.join(process.cwd(), './bundle.sh');

function initialize() {
  if (!entry) {
    console.log(chalk.white(chalk.cyan('[br]'), chalk.red('[Error]'), 'entry file should be defined'));
    return;
  }

  var resolved_deps = processPath(entry);

  if (cli.flags.watch) {
    file.watch(file.getPathes(resolved_deps), function (xpath) {
      console.log(chalk.white(chalk.cyan('[br]'), 'changes detected in file', chalk.underline.bgGreen(xpath)));
      processPath(entry);
    });
  }

  function processPath(xpath) {
    var filePath = path.join(process.cwd(), xpath);
    var deps = buildDepsGraph(filePath);
    var resolved_deps = file.resolveGraph(deps.getNode(filePath));
    var list = file.getData(resolved_deps);
    var build = file.mergeData(list);
    file.write(outdir, build);
    return resolved_deps;
  }
}

initialize();