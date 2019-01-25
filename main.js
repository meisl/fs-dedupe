'use strict';

const fs = require('fs'),
	util = require('util'),
	path = require('path');

module.exports.version = require('./package.json').version;

const stepSync = module.exports.stepSync = function (dirName) {
	let entries;
	
	//entries = fs.readdirSync(dirName);
	//return entries;
	
	entries = fs.readdirSync(dirName, { withFileTypes: true });
	return entries;
};

const _walkSync = function (startPath) {
	startPath = path.resolve(startPath) + path.sep;
	const todo = [],
		bySize = {},
		result = { start: startPath, files: [], folders: [] },
		readdirOptions = { withFileTypes: true }
	;
	let currentPath = '';
	while (true) {
		let entries = [];
		let currentPathAbs = startPath + currentPath;
		try {
			//entries = stepSync(currentPathAbs);
			entries = fs.readdirSync(currentPathAbs, readdirOptions);
		} catch (err) {
			if (err.code != 'EPERM') {
				throw err;
			}
			//console.log(err);
		}
		entries.forEach(e => {
			e.path = currentPath + e.name;
			try {

				if (e.isFile()) {
					result.files.push(e);
					const stats = e.stats = fs.statSync(currentPathAbs + e.name);
					const size = stats.size;
					let szList = bySize[size];
					if (szList == (void 0)) {
						bySize[size] = [e];
					} else {
						szList.push(e);
					}
				} else if (e.isDirectory()) {
					result.folders.push(e);
					todo.push(e);
				} else if (e.isSymbolicLink()) {
					let linkText = fs.readlinkSync(currentPathAbs + e.name);
					let tPathAbs = path.resolve(currentPathAbs, linkText);
					e.target = tPathAbs;
					let tStat;
					try {
						tStat = fs.statSync(tPathAbs);
						if (tStat.isDirectory()) {
							e.type = 'DIR';
						} else if (tStat.isFile()) {
							e.type = 'FILE';
						}
					} catch (err) {
						if (err.code != 'ENOENT') {
							throw err;
						}
						e.type = 'BROKE'
					}
					switch (e.type) {
						case 'DIR':
							result.folders.push(e);
							break;
						case 'FILE':
						case 'BROKE':
							result.files.push(e);
							break;
						default:
					}
				}
			} catch (err) {
				if (err.code != 'EPERM' && err.code != 'EBUSY') {
					throw err;
				}
				e.error = err;
			}
		});
		if (todo.length === 0) {
			const tmp = {};
			Object.keys(bySize)
				.filter(size => bySize[size].length > 1)
				//.filter(size => size > 4000)
				.forEach(size => tmp[size] = bySize[size])
			;
			result.bySize = tmp;
			return result;
		}
		let current = todo.shift();
		currentPath = current.path + path.sep;
	}
}

const walkSync = module.exports.walkSync = function (dirName) {
	let result = _walkSync(dirName);
	result.length = result.files.length + result.folders.length;
	
	return result;
};
