//required modules
var express = require("express");
var mysql = require('mysql');
var $ = require("jquery");

//serves files from server
var fs = require("fs");
var bodyParser = require("body-parser");
var serveStatic = require('serve-static');

//location for question materials
var path = require("path");
var testFolder = './Cards';

//Create connection to database
var db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database : 'nodemysql'
});

//Connect to db
db.connect((err) => {
	if(err){
		throw err;
	}
	console.log('MySql Connected...');
});

var app = express();
var connect = require('connect');

//Enable CORS on server
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


//launch and serve files
fs.readdir(testFolder, (err, files) => {
	var cards = [];
	files.forEach(file => {
		cards.push(file.substring(0, (file.length-4)));
	});
	
	fs.writeFileSync('./data.json', JSON.stringify(cards, null, 2), 'utf-8'); 
	
	connect().use(serveStatic(__dirname)).listen(8080, function(){
		console.log('Client server running on 8080...');
	});
});


app.listen('3000', () => {
	console.log('Database running on port 3000');
});

//Create Database
app.get('/createdb', (req, res) =>{
	let sql = 'CREATE DATABASE nodemysql';
	db.query(sql, (err, result) =>{
		if(err)	throw err;
		console.log(result);
		res.send('database created...');
	});
});

//Create table
app.get('/createscoretable', (req, res) => {
	let sql = 'CREATE TABLE scores(id INT AUTO_INCREMENT, name VARCHAR(255), score INT, PRIMARY KEY(id))';
	db.query(sql, (err, result) => {
		if(err) throw err;
		console.log(result);
		res.send('Score table created...');
	});
});

//Insert score
app.get('/addscore', (req, res) => {
	console.log(req.query);
	let post = {name:req.query["name"], score: req.query["score"]};
	let sql = 'INSERT INTO scores SET ?';
	let query = db.query(sql, post, (err, result) =>{
		if(err) throw err;
		console.log(result);
		res.send('Score added...');
	});
});

//Retrieve scores
app.get('/scores', (req, res) => {
	let sql = 'SELECT * FROM scores ORDER BY score DESC';
	let query = db.query(sql, (err, results) =>{
		if(err) throw err;
		res.send(results);
	});
});

