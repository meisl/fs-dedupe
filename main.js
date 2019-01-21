'use strict';

const fs = require('fs'),
	path = require('path');

module.exports.version = require('./package.json').version;

const stepSync = module.exports.stepSync = function (dirName) {
	let entries;
	
	entries = fs.readdirSync(dirName);
	return entries;
};

const _walkSync = function (start, todo, result) {
	while (todo.length > 0) {
		let dirName = todo.pop();
		let current = path.join(start, dirName);
		let entries = [];
		try {
			entries = stepSync(current);
		} catch (e) {
			if (e.code != 'EPERM') {
				throw e;
			}
		}
		result.folders.push({
			name: dirName
		});
		entries.forEach(e => {
			let entry = {
				name: path.join(dirName, e),
			};
			let ePath = path.join(current, e);
			let s = fs.lstatSync(ePath);
			if (s.isSymbolicLink()) {
				let linkText = fs.readlinkSync(ePath);
				let tPath = path.join(current, linkText);
				entry.target = tPath;
				let tStat;
				try {
					tStat = fs.statSync(tPath);
					if (tStat.isDirectory()) {
						entry.type = 'DIR';
					} else if (tStat.isFile()) {
						entry.type = 'FILE';
					}
				} catch (e) {
					if (e.code != 'ENOENT') {
						throw e;
					}
					entry.type = 'BROKE'
				}
				switch (entry.type) {
					case 'DIR':
						result.folders.push(entry);
						break;
					case 'FILE':
					case 'BROKE':
						result.files.push(entry);
						break;
					default:
				}
			}
			if (s.isDirectory()) {
				let more = path.join(dirName, e);
				todo.push(more);
			} else if (s.isSymbolicLink()) {
				// nothing
			} else if (s.isFile()) {
				result.files.push({ name: path.join(dirName, e) });
			}
		});
	}
}

const walkSync = module.exports.walkSync = function (dirName) {
	let result = { start: dirName, files: [], folders: [] };
	_walkSync(dirName, ['.'], result);
	result.folders.shift();
	result.length = result.files.length + result.folders.length;
	
	return result;
};
