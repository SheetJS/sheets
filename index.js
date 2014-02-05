var fs = require('fs'), path = require('path');
var tablify = require('asciitable');
var J = require('j');

function parsecsvline(line, options) {
	options = options || {};
	var cquote = '\"';
	var cdelim = ',';
	var fields = [], curfield = '';
	var quoted = false;
	for (var i = 0; i < line.length; ++i) {
		switch (line.charAt(i)) {
		case cquote:
			quoted = !quoted;
		/* falls through */
		default:
			curfield += line.charAt(i);
			break;
		case cdelim:
			if (!quoted) {
				if(curfield[0] === cquote) curfield = curfield.slice(1,-1);
				fields.push(curfield);
				curfield = '';
			} else { curfield += cdelim; }
			break;
		}
	}
	if(curfield[0] === cquote) curfield = curfield.slice(1,-1);
	fields.push(curfield);
	return fields;
}

function csvparse(data) {
	var d = [];
	data.split('\n').forEach(function(line) {
		if (line === '') return;
		d.push(parsecsvline(line));
	});
	return d;
}

function csvread(path) { return csvparse(fs.readFileSync(path, 'utf8')); }

function readfileraw(file) {
	var w = J.readFile(file);
	var sheetname = process.argv[3] || w[1].SheetNames[0];
	return csvparse(J.utils.to_csv(w)[sheetname]);
	//return csvread(file); 
}

function readfile(file) {
	var data = readfileraw(file);
	var massaged = data.slice(1).map(function(r) {var o = {}; r.forEach(function(c,i){o[data[0][i]] = c; }); return o; });
	return tablify(massaged, {fields:data[0], skinny:true, intersectionCharacter:'+'});
}

if(typeof require !== 'undefined' && typeof exports !== 'undefined') {
	module.exports = readfile;	
	if(typeof module !== 'undefined' && require.main === module) {
	console.log(readfile(process.argv[2]));
	}
}
