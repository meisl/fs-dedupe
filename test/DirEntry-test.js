'use strict';

const expect = require('expect.js'),
	skip = () => {},
	DirEntry = require('../lib/DirEntry');

function toJSONandBack(e) {
	let s, o;
	s = '{' + e.serialize() + '}';
	try {
		o = JSON.parse(s);
	} catch (err) {
		expect(s).to.be('<valid JSON> - got ' + err);
	}
	return o;
}
	
describe('DirEntry', () => {
	it('should be a Function', () => {
		expect(DirEntry).to.be.a(Function);
		let x = new DirEntry(null, 'foo');
		expect(x).to.be.a(DirEntry);
		expect(x).to.have.property('parent', null);
	});
	describe('serialize', () => {
		it('File', () => {
			const name = 'foo.txt';
			let x = DirEntry.create(null, {
				name,
				isFile: () => true,
				isDirectory: () => false
			});
			let o = toJSONandBack(x);
			expect(o).to.have.property(name);
			expect(o[name]).to.be.an(Array);
			expect(o[name]).to.have.length(0);
			
		});
		it('empty Folder', () => {
			const name = 'bar';
			let x = DirEntry.create(null, {
				name,
				isFile: () => false,
				isDirectory: () => true
			});
			let o = toJSONandBack(x);
			expect(o).to.have.property(name);
			expect(o[name]).to.have.length(-1);
			
		});
		it('Folder with children', () => {
			const name = 'daddy';
			let daddy = DirEntry.create(null, {
				name: 'daddy',
				isFile: () => false,
				isDirectory: () => true
			});
			let folderChild = DirEntry.create(daddy, {
				name: 'folderChild',
				isFile: () => false,
				isDirectory: () => true
			});
			let fileChild = DirEntry.create(daddy, {
				name: 'fileChild',
				isFile: () => true,
				isDirectory: () => false
			});
			let o = toJSONandBack(daddy);
			expect(o).to.have.property(daddy.name);
			expect(o[name]).to.have.length(-1);
			
		});
	});
});

