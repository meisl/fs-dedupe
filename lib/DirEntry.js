'use strict';

const fs = require('fs'),
	util = require('util'),
	path = require('path');
	


class DirEntry {
	constructor(parent, name, atime, mtime, ctime, birthtime) {
		this.parent = parent;
		this.name = name;
		this.atime = atime;
		
		if (parent) {
			parent.children.push(this);
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
		this.children = [];
	}
	addFile(name, atime, mtime, ctime, birthtime) {
		Object.create(DirEntry.prototype, {
			
			
		});
	}
	serialize() {
		return JSON.stringify(this.name)
			+ ':{'
			+ '"":' + this.serializeTimes()
			+ (this.children.length 
				? ',' + this.children.map(c => c.serialize()).join(',')
				: '')
			+ '}'
		;
	}
}

class File extends DirEntry {
	constructor(parent, name, atime, mtime, ctime, birthtime) {
		super(parent, name, atime, mtime, ctime, birthtime);
	}
	serialize() {
		let t = this.serializeTimes();
		return JSON.stringify(this.name)
			+ ':['
			+ t.substring(1, t.length - 1)
			+ ',' + JSON.stringify(this.size === void 0 ? null : this.size)
			+ ']'
		;
		
	}
}


module.exports = DirEntry;

