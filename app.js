var express = require('express');
var port = process.argv[2];
var app = express();


/*
app.use('/getDNAs', function(req, res, next) {
	console.log('got a GET to /getDNAs');
	next();
});

app.use('/genDNA', funciton(req, res, next) {
	console.log('got a POST to /genDNA');
});
*/

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



var morgan = require('morgan');
var colors = require('colors');
app.use(morgan(
	':method '.magenta +
	':url '.green +
	':status '.blue +
	':res[content-length] '.italic.grey + 'bits '.italic.grey
	+ 'sent in ' + ':response-time ms'.grey
));



var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



var mongoose = require('mongoose');

// use local MongoDB
var url = 'mongodb://localhost/test';

// or use mongolab
// var url = 'mongodb://myuser:mypass@ds028017.mongolab.com:28017/mydb';

mongoose.connect(url);

var DNASchema = mongoose.Schema({
	'sequence': String,
	'len': Number
});
var DNASeq = mongoose.model('dna', DNASchema);



var cp = require('child_process');
app.post('/genDNA', function(request, response) {
	var n = request.body.n;

	var results =  {
		output: null,
		errorlog: null,
		exitcode: null
	};

	var genDNAScript = cp.spawn('python3', ['genDNA.py', n]);

	// get stdout
	genDNAScript.stdout.on('data', function(stdout) {
		results.output = stdout.toString();
	});

	// get stderr
	genDNAScript.stderr.on('data', function(stderr) {
		results.errorlog = stderr.toString();
	});

	// script finished
	genDNAScript.on('close', function(code) {
		results.exitcode = code;

		// Respond on process close
		// otherwise, async problems!
		if (code === 0) {
			// success, store sequence in DB
			var seq = new DNASeq({
				sequence: results.output,
				len: n
			});

			seq.save(function(err, sequence) {
				if (err) console.error(err);
				console.log('saved sequence');
			});
		}
		response.send(results);

	});
});



app.get('/dnas', function(req, res) {
    DNASeq.find(function(err, dnas) {
        if (err) console.error(err);
        res.send(dnas);
    });
});



app.use(express.static('public'));
console.log('Serving content from ' + 'public'.blue);


app.listen(port);
console.log('Express sever listening on port ' + port);
