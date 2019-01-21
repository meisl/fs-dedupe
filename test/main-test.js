'use strict';

const expect = require('expect.js'),
	util = require('util'),
	main = require('../');

describe('main.js', function () {

	it('should get the version', function () {
		expect(main.version).to.match(/\d+\.\d+\.\d+/);
	});

});

