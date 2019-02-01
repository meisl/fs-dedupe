'use strict';

const expect = require('expect.js'),
	skip = () => {},
	DirEntry = require('../lib/DirEntry');

function serializeAndParse(e) {
	let s, o;
	s = e.serialize();
	expect(s).to.be.a('string');
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
			let o = serializeAndParse(x);
			expect(o).to.be.an(Array);
			expect(o).to.have.property('length').greaterThan(3);
		});
		it('empty Folder', () => {
			const name = 'bar';
			let x = DirEntry.create(null, {
				name,
				isFile: () => false,
				isDirectory: () => true
			});
			let o = serializeAndParse(x);
			expect(o).to.be.an(Object);
			expect(o).not.to.be.an(Array);
			expect(o).to.only.have.keys('');
			let t = o[''];
			expect(t).to.be.an(Array);
			expect(t).to.have.property('length').greaterThan(3);
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
			let o = serializeAndParse(daddy);
			expect(o).to.be.an(Object);
			expect(o).not.to.be.an(Array);
			expect(o).to.only.have.keys('', 'folderChild', 'fileChild');
			let t = o[''];
			expect(t).to.be.an(Array);
			expect(t).to.have.property('length').greaterThan(3);
		});
	});
});

