var fs = require("fs");
var path = require("path");
var http = require("http");
var express = require("express");
var bodyParser = require('body-parser');
var ejs = require("ejs");
var mysql = require("mysql");
var app = express();

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', ejs.renderFile);

var pool = mysql.createPool({
	connectionLimit: 100,
	host: "localhost",
	user: "root",
	password: "rijukris",
	database: "AadhaarInfo",
});

var dbCon;
var totalCount;

app.get("/", function(req, res) {
	return res.render('index.html');
});

app.get("/home", function(req, res) {
	fs.readFile("views/home.html", "utf-8", function(ferr, tpl) {
		if (ferr)
			res.json({"status": "ERROR", message: ferr.message});
		else
			return res.json({"status": "OK", "html": tpl});
	});
});

app.get("/addContactForm", function(req, res) {
	console.log(req.method, req.url);
	return res.render('addContactForm.html');
});

app.get("/modifyAadhaarForm", function(req, res) {
	console.log(req.method, req.url);
	return res.render('modifyAadhaarForm.html');
});

app.get("/deleteAadhaarForm", function(req, res) {
	console.log(req.method, req.url);
	return res.render('deleteAadhaarForm.html');
});

app.get("/modifyContactForm", function(req, res) {
	console.log(req.method, req.url, req.query.aadhaar);
	var queryStr = "SELECT * from AADHAAR where aadhaar=" + req.query.aadhaar;
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": "Aadhaar info for " + req.query.aadhaar + " failed with " + err.message });
		}
		else
		{
			if (rows.length > 0)
			{
				fs.readFile("views/modifyContactForm.html", "utf-8", function(ferr, tpl) {
					if (ferr)
						res.json({"status": "ERROR", message: ferr.message});
					else
					{
						var html = ejs.render(tpl, { data: rows[0] });
						return res.json({"status": "OK", aadhaar: rows[0], "html": html});
					}
				});
			}
			else
			{
				return res.json({ "status": "ERROR", "message": "Aadhaar info for " + req.query.aadhaar + " does not exist."});
			}
		}
	});
});

app.get("/deleteContactForm", function(req, res) {
	console.log(req.method, req.url, req.query.aadhaar);
	var queryStr = "SELECT * from AADHAAR where aadhaar=" + req.query.aadhaar;
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": "Aadhaar info for " + req.query.aadhaar + " failed with " + err.message });
		}
		else
		{
			if (rows.length > 0)
			{
				fs.readFile("views/deleteContactForm.html", "utf-8", function(ferr, tpl) {
					if (ferr)
						res.json({"status": "ERROR", message: ferr.message});
					else
					{
						var html = ejs.render(tpl, { data: rows[0] });
						return res.json({"status": "OK", aadhaar: rows[0], "html": html});
					}
				});
			}
			else
			{
				return res.json({ "status": "ERROR", "message": "Aadhaar info for " + req.query.aadhaar + " does not exist."});
			}
		}
	});
});

app.get("/display", function(req, res) {
	console.log(req.method, req.url);
	var queryStr = "SELECT * from AADHAAR";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": err.message });
		}
		else
		{
			fs.readFile("views/display.html", "utf-8", function(ferr, tpl) {
				if (ferr)
					res.json({"status": "ERROR", message: ferr.message});
				else
				{
					var html = ejs.render(tpl, { data: rows });
					return res.json({"status": "OK", "html": html});
				}
			});
		}
	});
});

app.get("/browse", function(req, res) {
	console.log(req.method, req.url);
	var queryStr = "SELECT * from AADHAAR";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": err.message });
		}
		else
		{
			fs.readFile("views/browse.html", "utf-8", function(ferr, tpl) {
				if (ferr)
					res.json({"status": "ERROR", message: ferr.message});
				else
				{
					var html = ejs.render(tpl, {});
					return res.json({"status": "OK", "html": tpl, "aadhaars": rows});
				}
			});
		}
	});
});

app.get("/search", function(req, res) {
	console.log(req.method, req.url);
	var queryStr = "SELECT * from AADHAAR";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": err.message });
		}
		else
		{
			fs.readFile("views/browse.html", "utf-8", function(ferr, tpl) {
				if (ferr)
					res.json({"status": "ERROR", message: ferr.message});
				else
				{
					var searchRes = [];
					rows.forEach(function(r) {
						var str = Object.values(r).join(" ").toLowerCase();
						console.log("str=" + str);
						if (str.indexOf(req.query.pattern.toLowerCase()) != -1)
							searchRes.push(r);
					});
					var html = ejs.render(tpl, {});
					console.log("searchRel: " + searchRes.length);
					return res.json({"status": "OK", "html": tpl, "aadhaars": searchRes});
				}
			});
		}
	});
});

app.post("/addContact", function(req, res) {
	console.log(req.method, req.url, req.body.first_name);
	var queryStr = "INSERT into AADHAAR values (" + req.body.aadhaar + ", '" + req.body.first_name + "', '" 
				 + req.body.last_name + "', '" + req.body.address + "', '" 
				 + req.body.city + "', '" + req.body.state + "', " + req.body.zip + ")";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
			return res.json({ "status": "ERROR", "message": "Database insert failed with " + err.message });
		else
		{
			totalCount += rows.affectedRows;
			io.emit("aadhaar-count", { count: totalCount });
			return res.json({ "status": "OK", "message": "Aadhaar info for " + req.body.aadhaar + " saved." });
		}
	});
});

app.put("/modifyContact", function(req, res) {
	console.log(req.method, req.url, req.body.first_name);
	var queryStr = "UPDATE AADHAAR set first_name='" + req.body.first_name + "', last_name='"+ req.body.last_name + "', address='"
			 + req.body.address + "', city='"+ req.body.city + "', state='" + req.body.state + "', zip="
			 + req.body.zip + " where aadhaar=" + req.body.aadhaar + "";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": "Database update failed with " + err.message });
		}
		else
		{
			if (rows.affectedRows > 0)
				return res.json({ "status": "OK", "message": "Aadhaar info for " + req.body.aadhaar + " updated." });
			else
				return res.json({ "status": "ERROR", "message": "Aadhaar info for " + req.body.aadhaar + " does not exist." });
		}
	});
});

app.delete("/deleteContact", function(req, res) {
	console.log(req.method, req.url, req.body.first_name);
	var queryStr = "delete from AADHAAR where aadhaar=" + req.body.aadhaar;
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": "Database delete failed with " + err.message });
		}
		else
		{
			if (rows.affectedRows > 0)
			{
				totalCount -= rows.affectedRows;
				io.emit("aadhaar-count", { count: totalCount });
				return res.json({ "status": "OK", "message": "Aadhaar info for " + req.body.aadhaar + " deleted." });
			}
			else
				return res.json({ "status": "ERROR", "message": "Aadhaar info for " + req.body.aadhaar + " does not exist." });
		}
	});
});

function getAadhaarCount(cb)
{
	var queryStr = "SELECT * from AADHAAR";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
			return cb(err, null);
		else
			return cb(null, rows.length);
	});
}

var server = http.createServer(app);
var io = require("socket.io")(server);

server.listen(3000, function() {
	console.log("Server listening on port 3000");

	pool.getConnection(function(err, con) {
		if (err)
		{
			console.log(err.message);
			process.exit(1);
		}
		else
		{
			dbCon = con;
			io.on('connection', function(socket) {
				getAadhaarCount(function(err, count) {
					totalCount = count;
					io.emit("aadhaar-count", { count: count });
				});
			});
		}
	});
});
