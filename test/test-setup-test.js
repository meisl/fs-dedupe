'use strict';

const expect = require('expect.js'),
	util = require('util'),
	fs = require('fs');

const path_fix = 'test/fixtures',
	path_inaccassible = path_fix + '/inaccessible';

describe('test-setup: ' + path_fix, function () {

	it('should exist', function () {
		let s = fs.statSync(path_fix);
		expect(s.isDirectory()).to.be(true);
	});

	describe('"inaccessible/"', function () {
		it('should be a sub-directory', function () {
			let s = fs.lstatSync(path_inaccassible);
			expect(s.isDirectory()).to.be(true);
			expect(s.isSymbolicLink()).to.be(false);
		});

		it('should be non-listable', function () {
			let test = function () {
				fs.readdirSync(path_inaccassible);
			}
			expect(test).to.throwException(e => {
				expect(e).to.be.an(Error);
				expect(e.code).to.be('EPERM');
			});
		});
	});

	describe('"symlink-to-dir/"', function () {
		it('should be a directory link', function () {
			let p = path_fix + '/symlink-to-dir/';
			expect(fs.statSync(p).isDirectory()).to.be(true);
			expect(fs.lstatSync(p).isSymbolicLink()).to.be(true);
		});
	});

	describe('"to-outside/symlink-to-outside-dir/"', function () {
		it('should be a directory link', function () {
			let p = path_fix + '/to-outside/symlink-to-outside-dir/';
			expect(fs.statSync(p).isDirectory()).to.be(true);
			expect(fs.lstatSync(p).isSymbolicLink()).to.be(true);
		});
	});

	describe('readdirSync(withFileTypes)', () => {
		describe('dirent of symlinked dir', () => {
			it('should have .isDirectory()===false', () => {
				let entries = fs.readdirSync(path_fix, { withFileTypes: true });
				let e;
				e = entries.filter(e => e.name == 'symlink-to-dir');
				expect(e).to.have.length(1);
				expect(e[0].isDirectory()).to.be(false);
				expect(e[0].isFile()).to.be(false);
				expect(e[0].isSymbolicLink()).to.be(true);
			});
		});
	});
	
	describe('statSync of C:\\Programme', () => {
		it('should work', () => {
			let entry = fs.readdirSync('C:\\', { withFileTypes: true })
				.filter(e => e.name == 'Programme')
				[0]
			;
			let stats = fs.statSync('C:\\Programme');
			expect(stats.isDirectory()).to.be(true);
		});
	});

});

