'use strict';

const expect = require('expect.js'),
	path = require('path'),
	{ stepSync, walkSync } = require('../');

const path_fix = path.join('test', 'fixtures'),
	path_inaccassible = path.join(path_fix, 'inaccessible'),
	path_nonexistent = path.join('i', 'do', 'not', 'exist');

describe('stepSync', function () {

	it('on a file should throw', function () {
		expect(stepSync).withArgs('one.txt').to.throwException(e =>
			expect(e).to.have.property('code', 'ENOENT')
		);
	});

	it('into non-existent dir should throw', function () {
		expect(walkSync).withArgs(path_nonexistent).to.throwException(e =>
			expect(e).to.have.property('code', 'ENOENT')
		);
	});

	it('into dir with insufficient permissions should throw', function () {
		expect(stepSync).withArgs(path_inaccassible).to.throwException(e =>
			expect(e).to.have.property('code', 'EPERM')
		);
	});

	it('on proper directory should list entries on the top level', function () {
		let entries = stepSync(path_fix);
		expect(entries).to.have.length(9);
	});

	it('on symlinked directory should list entries on the top level', function () {
		let dirName = path.join(path_fix, 'symlink-to-dir');
		let entries = stepSync(dirName);
		expect(entries).to.be.an(Array);
		expect(entries).to.have.length(2);
	});

});

describe('walkSync', function () {

	it('on a file should throw', function () {
		expect(walkSync).withArgs('one.txt').to.throwException(e =>
			expect(e).to.have.property('code', 'ENOENT')
		);
	});

	it('into non-existent dir should throw', function () {
		expect(walkSync).withArgs(path_nonexistent).to.throwException(e =>
			expect(e).to.have.property('code', 'ENOENT')
		);
	});

	it('into dir with insufficient permissions should return empty result', function () {
		let entries = walkSync(path_inaccassible);
		expect(entries).to.have.length(0);
		expect(entries).to.have.property('folders');
		expect(entries.folders).to.eql([]);
		expect(entries).to.have.property('files');
		expect(entries.files).to.eql([]);
	});

	it('on symlinked directory should list all entries from lower levels', function () {
		let startDir = path.join(path_fix, 'symlink-to-dir');
		let entries = walkSync(startDir);
		expect(entries).to.have.length(2);
		expect(entries.files).to.have.length(2);
		let fileNames = entries.files.map(e => e.name);
		expect(fileNames).to.contain('one.txt');
		expect(fileNames).to.contain('two.txt');
		
	});

	it('should NOT follow symlinked dirs outside the starting directory', function () {
		let startDir = path.join(path_fix, 'to-outside');
		let entries = walkSync(startDir);
		expect(entries).to.have.length(3);
		expect(entries.files).to.have.length(1);
		expect(entries.files.map(e => e.name)).to.contain('symlink-to-outside-file');
		expect(entries.folders).to.have.length(2);
		let folderNames = entries.folders.map(e => e.name);
		expect(folderNames).to.contain('symlink-to-outside-dir');
		expect(folderNames).to.contain('symlink-to-not-so-outside-dir');
	});

	it('on proper directory should list all entries from lower levels', function () {
		let entries = walkSync(path_fix);
		let exp;
		
		let folderNames = entries.folders.map(e => e.name);
		expect(folderNames).to.contain('to-outside');
		expect(folderNames).to.contain(
			path.join('to-outside', 'symlink-to-outside-dir'));
		expect(entries.folders).to.have.length(8);
		
		let fileNames = entries.files.map(e => e.name);
		exp = [
			'zero.txt',
			'one.txt',
			'symlink-to-symlink-to-file',
			'broken-symlink',
			path.join('a', 'one.txt'),
			path.join('a', 'symlink-to-two.txt'),
			path.join('b', 'c', 'one.txt'),
			path.join('b', 'c', 'two.txt'),
			path.join('to-outside', 'symlink-to-outside-file'),
		];
		exp.forEach(x => {
			expect(fileNames).to.contain(x);
		});
		expect(entries.files).to.have.length(exp.length);
		
		expect(entries).to.have.length(entries.files.length + entries.folders.length);
	});

	
});

