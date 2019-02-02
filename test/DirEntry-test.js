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
		expect(x.parent).to.be(undefined);
	});
	describe('.fromJSON', () => {
		it('with no argument should throw', () => {
			expect(DirEntry.fromJSON).withArgs().to.throwException();
		});
		it('with invalid JSON string should throw', () => {
			expect(DirEntry.fromJSON).withArgs('').to.throwException();
		});
		it('with stringified array of wrong size should throw', () => {
			[
				'[]', '[0]', '[0,1]', '[0,1,2]', '[0,1,2,3]', 
				'[0,1,2,3,4,5,6]', '[0,1,2,3,4,5,6,7]'
			].forEach(s => expect(DirEntry.fromJSON).withArgs(s).to.throwException());
		});
		it('with stringified object should throw', () => {
			expect(DirEntry.fromJSON).withArgs('{}').to.throwException();
		});
		describe('with stringified array', () => {
			it('of 6 numbers should throw', () => {
				expect(DirEntry.fromJSON).withArgs('[0,1,2,3,4,5]').to.throwException();
			});
			it('of 5 numbers and a string yields a File', () => {
				let o, s = '[0, 1, 2, 3, 23, ""]';
				o = DirEntry.fromJSON(s);
				expect(o).to.be.a(DirEntry.File);
				expect(o.parent).to.be(undefined);
				expect(o).to.have.property('name');
				expect(o).to.have.property('atime', 0);
				expect(o).to.have.property('mtime', 1);
				expect(o).to.have.property('ctime', 2);
				expect(o).to.have.property('birthtime', 3);
				expect(o).to.have.property('size', 23);
				expect(o).to.have.property('sha1', "");
			});
			skip('of 4 numbers and a string yields symlink', () => {
				let o, s = '[0, 1, 2, 3, "../foo"]';
				o = DirEntry.fromJSON(s);
				expect(o).to.be.a(DirEntry.Link);
				expect(o.parent).to.be(undefined);
				expect(o).to.have.property('name');
				expect(o).to.have.property('atime', 0);
				expect(o).to.have.property('mtime', 1);
				expect(o).to.have.property('ctime', 2);
				expect(o).to.have.property('birthtime', 3);
				expect(o).to.have.property('text', '../foo');
			});
			it('of 4 numbers and empty obj yields empty Folder', () => {
				let o, s = '[0, 1, 2, 3, {}]';
				o = DirEntry.fromJSON(s);
				expect(o).to.be.a(DirEntry.Folder);
				expect(o.parent).to.be(undefined);
				expect(o).to.have.property('name');
				expect(o).to.have.property('atime', 0);
				expect(o).to.have.property('mtime', 1);
				expect(o).to.have.property('ctime', 2);
				expect(o).to.have.property('birthtime', 3);
				expect(o).to.have.property('entries').empty();
				expect(o).to.have.property('entriesByName');
				expect(o.entriesByName).to.be.an('object');
				expect(o.entriesByName).to.be.empty();
			});
			it('of 4 numbers and non-empty obj yields non-empty Folder', () => {
				let o, s = '[0, 1, 2, 3, { "fileChild": [4, 5, 6, 7, 42, ""]}]';
				o = DirEntry.fromJSON(s);
				expect(o).to.be.a(DirEntry.Folder);
				expect(o.parent).to.be(undefined);
				expect(o).to.have.property('name');
				expect(o).to.have.property('atime', 0);
				expect(o).to.have.property('mtime', 1);
				expect(o).to.have.property('ctime', 2);
				expect(o).to.have.property('birthtime', 3);
				expect(o).to.have.property('entries').length(1);
				const c = o.entries[0];
				expect(c).to.be.a(DirEntry.File);
				expect(c.parent).to.be(o);
				expect(c).to.have.property('name', 'fileChild');
				expect(o.entriesByName).to.be.an('object');
				expect(o.entriesByName).to.only.have.key('fileChild');
				expect(o.entriesByName).to.have.property('fileChild', c);
			});
		});
	});
	describe('serialize', () => {
		it('File', () => {
			const name = 'foo.txt';
			let x = DirEntry.fromJSON('[0,1,2,3,42,""]');
			let o = serializeAndParse(x);
			expect(o).to.be.an(Array).length(6);
		});
		it('empty Folder', () => {
			const name = 'bar';
			let x = DirEntry.fromJSON('[1,2,3,4,{}]');
			let o = serializeAndParse(x);
			expect(o).to.be.an(Array).length(5);
			expect(o).to.have.property(0).eql(1);
			expect(o).to.have.property(1).eql(2);
			expect(o).to.have.property(2).eql(3);
			expect(o).to.have.property(3).eql(4);
			expect(o).to.have.property(4).an(Object).empty();
			expect(o[4]).to.not.be.an(Array);
		});
		it('Folder with children', () => {
			const sha1 = "83f2f8a5cfe258c66a71b561046514a3a8359a91";
			const raw = [1, 2, 3, 4, {
				fileChild: [8, 9, 10, 11, 4711, sha1], 
				folderChild: [5, 6, 7, 8, {}]
			}];
			let daddy = DirEntry.fromJSON(JSON.stringify(raw));
			let o = serializeAndParse(daddy);
			expect(o).to.be.an(Array).length(5);
			expect(o).to.eql(raw);
		});
	});
});

