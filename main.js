'use strict';

const fs = require('fs');

module.exports.version = require('./package.json').version;

const stepSync = module.exports.stepSync = function (path) {
	let entries;
	
	entries = fs.readdirSync(path, { withFileTypes: true });
	return entries;
};

const walkSync = module.exports.walkSync = function (path) {
	let entries = [];
	try {
		entries = stepSync(path);
	} catch (e) {
		if (e.code != 'EPERM') {
			throw e;
		}
	}
	return entries;
};
