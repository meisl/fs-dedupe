'use strict';

const expect = require("expect.js"),
	util = require("util"),
	main = require("../");

describe('main.js', function () {

	it('should get the version', function () {
		expect(main.version).to.match(/\d+\.\d+\.\d+/);
	});

	
	describe('scan', function () {
		
		it('should list all files', function () {
			let entries = main.scan('test/fixtures');
			expect(entries).to.be.an(Array);
			expect(entries).to.have.length(10);
			//expect(entries).to.be("asdf");
		});
		
	});
});

