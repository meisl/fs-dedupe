'use strict';

const fs = require('fs');

module.exports.version = require('./package.json').version;

module.exports.stepSync = function (path) {
	let entries;
	
	entries = fs.readdirSync(path, { withFileTypes: true });
	return entries;
};

