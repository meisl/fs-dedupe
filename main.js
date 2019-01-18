'use strict';

const glob = require('glob');

module.exports.version = require('./package.json').version;

module.exports.scan = function (path) {
	let entries = glob.sync('**', { cwd: path, mark: true });
	
	
	return entries;
};

