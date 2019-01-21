'use strict';

const expect = require('expect.js'),
	util = require('util'),
	{ stepSync, walkSync } = require('../');

const path_fix = 'test/fixtures',
	path_inaccassible = path_fix + '/inaccessible';

describe('stepSync', function () {

	it('into non-existent dir should throw', function () {
		expect(stepSync).withArgs('i/do/not/exist').to.throwException(e =>
			expect(e.code).to.be('ENOENT')
		);
	});

	it('into dir with insufficient permissions should throw', function () {
		expect(stepSync).withArgs(path_inaccassible).to.throwException(e =>
			expect(e.code).to.be('EPERM')
		);
	});

	it('should list directory entries on the top level', function () {
		let entries = stepSync(path_fix);	//	'K:');	//	
		expect(entries).to.be.an(Array);
		expect(entries).to.have.length(8);
	});

});

describe('walkSync', function () {

	it('into non-existent dir should throw', function () {
		expect(walkSync).withArgs('i/do/not/exist').to.throwException(e =>
			expect(e.code).to.be('ENOENT')
		);
	});

	it('into dir with insufficient permissions should return empty array', function () {
		let entries = walkSync(path_inaccassible);
		expect(entries).to.be.an(Array);
		expect(entries).to.have.length(0);
	});


	it('should NOT follow symlinked dirs outside the starting directory', function () {
		let entries = walkSync(path_fix + '/to-outside');
		expect(entries).to.be.an(Array);
		expect(entries).to.have.length(1);
		expect(entries[0]).to.have.property('name', 'symlink-to-outside-dir');
	});

});

