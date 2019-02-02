'use strict';

const fs = require('fs'),
	util = require('util'),
	path = require('path');
	


class DirEntry {
	constructor(parent, name, atime, mtime, ctime, birthtime) {
		this.name = name;
		this.atime = atime;
		this.mtime = mtime;
		this.ctime = ctime;
		this.birthtime = birthtime;
		if (parent) {
			parent.addEntry(this);
		}
	}
	
	static create(parent, dirEnt) {
		let result;
		if (dirEnt.isFile()) {
			result = new File(parent, dirEnt.name, Date.now());
		} else if (dirEnt.isDirectory()) {
			result = new Folder(parent, dirEnt.name);
		} else {
			throw new TypeError('cannot create DirEntry from ' + dirEnt);
		}
		return result;
	}
	
	static fromJSON(s) {
		const root = JSON.parse(s, function (key, value) {
			let result = value;
			if (Array.isArray(value)) {
				const [atime, mtime, ctime, birthtime] = value;
				switch (value.length) {
					case 6:
						const size = value[4],
							sha1 = value[5];
						if (typeof sha1 !== 'string') {
							throw new Error('invalid serialization: sha1 == ' + JSON.stringify(sha1));
						}
						result = Object.create(File.prototype, {
							name: { enumerable: true, value: key || null },
							atime: { enumerable: true, value: atime },
							mtime: { enumerable: true, value: mtime },
							ctime: { enumerable: true, value: ctime },
							birthtime: { enumerable: true, value: birthtime },
							size: { enumerable: true, value: size },
							sha1: { enumerable: true, value: sha1 }
						});
						break;
					case 5:
						const x = value[4],
							tx = typeof x;
						if (tx === 'object') {
							result = Object.create(Folder.prototype, {
								name: { enumerable: true, value: key || null },
								atime: { enumerable: true, value: atime },
								mtime: { enumerable: true, value: mtime },
								ctime: { enumerable: true, value: ctime },
								birthtime: { enumerable: true, value: birthtime },
								entriesByName: { enumerable: true, value: x }
							});
							result.entries = Object.values(x).map(child => {
								child.parent = result;
								return child;
							});
						} else if (tx === 'string') {
							throw 'symlink NYI';
						} else {
							throw new Error('invalid serialization: member @ 5 is ' + tx);
						}
						break;
					default:
						throw new Error('invalid serialization');
				}
			}
			return result;
		});
		if (root instanceof DirEntry)
			return root;
		throw new Error('invalid serialization');
	}
	
	serializeTimes() {
		let s = JSON.stringify([
			this.atime,
			this.mtime,
			this.ctime,
			this.birthtime
		]);
		return s;
	}
	
}

class Folder extends DirEntry {
	constructor(parent, name, atime, mtime, ctime, birthtime) {
		super(parent, name, atime, mtime, ctime, birthtime);
		this.entries = [];
		this.entriesByName = {};
	}
	addEntry(child) {
		const cName = child.name;
		const existing = this.entriesByName[cName];
		if (existing) {
			throw new Error('entry "' + cName + '" already exists in ' + name);
		}
		this.entriesByName[cName] = child;
		this.entries.push(child);
		child.parent = this;
	}
	serialize() {
		const t = this.serializeTimes();
		return t.substring(0, t.length - 1)
			+ ',{'
			+ this.entries.map(c => JSON.stringify(c.name) + ':' + c.serialize()).join(',')
			+ '}]'
		;
	}
};

class File extends DirEntry {
	constructor(parent, name, atime, mtime, ctime, birthtime) {
		super(parent, name, atime, mtime, ctime, birthtime);
		this.size = -1;
		this.sha1 = "";
	}
	serialize() {
		let t = this.serializeTimes();
		return '['
			+ t.substring(1, t.length - 1)
			+ ',' + JSON.stringify(this.size === void 0 ? null : this.size)
			+ ',' + JSON.stringify(this.sha1)
			+ ']'
		;
		
	}
};

DirEntry.Folder = Folder;
DirEntry.File = File;
module.exports = DirEntry;

