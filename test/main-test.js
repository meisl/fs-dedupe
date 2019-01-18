var expect = require("expect.js"),
	main = require("../");

describe('main.js', function() {

	it('should get the version', function() {
		expect(main.version).to.match(/\d+\.\d+\.\d+/);
	});

})