'use strict';

const expect = require('expect.js'),
	fs = require('fs');

const path_fix = 'test/fixtures',
	path_inaccassible = path_fix + '/inaccessible';
	
describe(path_fix, function () {

	it('should exist', function () {
		let s = fs.statSync(path_fix);
		expect(s.isDirectory()).to.be(true);
	});

	it('should contain directory "inaccessible/"', function () {
		let s = fs.statSync(path_inaccassible);
		expect(s.isDirectory()).to.be(true);
	});

	it(path_inaccassible + ' should be non-listable', function () {
		let test = function () {
			fs.readdirSync(path_inaccassible);
		}
		expect(test).to.throwException(e => {
			expect(e).to.be.an(Error);
			expect(e.code).to.be('EPERM');
		});
	});

});

