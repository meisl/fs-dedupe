'use strict';

const expect = require('expect.js'),
	util = require('util'),
	{ stepSync, walkSync } = require('../');

describe('stepSync', function () {

	it('should list directory entries on the top level', function () {
		let entries = stepSync('test/fixtures');	//	'K:');	//	
		expect(entries).to.be.an(Array);
		expect(entries).to.have.length(8);
		//expect(entries).to.be("asdf");
	});

});

