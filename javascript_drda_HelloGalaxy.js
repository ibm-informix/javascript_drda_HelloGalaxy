/**
 * Javascript Sample Application: Connect to Informix using DRDA
 **/

/**
 * Topics
 * 1 Create table
 * 2 Inserts
 * 2.1 Insert a single document into a table
 * 2.2 Insert multiple documents into a table
 * 3 Queries
 * 3.1 Find one document in a table that matches a query condition
 * 3.2 Find documents in a table that match a query condition
 * 3.3 Find all documents in a table
 * 3.4 Count documents with query
 * 3.5 Order documents in a table
 * 3.6 Join tables
 * 3.7 Find distinct fields in a table
 * 3.8 Find with projection clause
 * 4 Update documents in a table
 * 5 Delete documents in a table
 * 6 Transactions
 * 7 Commands
 * 7.1 Count
 * 7.2 Distinct
 * 8 Drop a table
 **/

var express = require('express');
var app = express();
var ibmdb = require("ibm_db");

//To run locally, set the URL here.
var URL = "";

var USE_SSL = false;
var port = process.env.VCAP_APP_PORT || 3030;

var tableName = "cities";
var tableJoin = "country";
var sql = "";

var commands = [];

function doEverything(res){
	commands = [];
	
	url = URL;
	if (url == null || url == "") {
		url = parseVcap();
	}
	
	ibmdb.open(url, function(err, conn) {

		if (err){ handleError(err, res, conn); return; }

		commands.push("Connected to " + url);
	
		//sample data
		function City (name, population, longitude, latitude, countryCode) {
			this.name = name;
			this.population = population;
			this.longitude = longitude;
			this.latitude = latitude;
			this.countryCode = countryCode;
		}
		  
		City.prototype.toString = function toString() {
			return "city: " + this.name + "  \tpopulation: " + this.population + "\tlongitude: " + this.longitude + 
			"\tlatitude: " + this.latitude  +  "\tcode: " + this.countryCode;
		};
		
		City.prototype.toSQL = function toSQL() {
			return "('" + this.name + "', " + this.population + ", " + this.longitude + ", " + this.latitude + ", " + this.countryCode + ")";
		};
		
		var kansasCity = new City("Kansas City", 467007, 39.0997, 94.5783, 1);
		var seattle = new City("Seattle", 652405, 47.6097, 122.3331, 1);
		var newYork = new City("New York", 8406000, 40.7127, 74.0059, 1);
		var london = new City("London", 8308000, 51.5072, 0.1275, 44);
		var tokyo = new City("Tokyo", 13350000, 35.6833, -139.6833, 81);
		var madrid = new City("Madrid", 3165000, 40.4001, 3.7167, 34);
		var melbourne = new City("Melbourne", 4087000, -37.8136, -144.9631, 61);
		var sydney = new City("Sydney", 4293000, -33.8651, -151.2094, 61);
	
		try {
			//1 Create table
			commands.push("\nTopics");
			commands.push("\n1 Create table");
			
			sql = "create table if not exists " + tableName + " (City VARCHAR(255), Population INTEGER, Longitude DECIMAL(8,4), Latitude DECIMAL(8,4), Code INTEGER)";
			conn.prepareSync(sql).executeSync().closeSync();
	
			commands.push("\tCreate a table named: " + tableName);
			commands.push("\tCreate Table SQL: " + sql);
	
			//2 Inserts
			//2.1 Insert a single document into a table
	
			commands.push("\n2 Inserts");
			commands.push("2.1 Insert a single document into a table");
			
			sql = "insert into " + tableName + " VALUES " + kansasCity.toSQL();
			conn.prepareSync(sql).executeSync().closeSync();
	
			commands.push("\tCreate Document -> " + kansasCity.toString());
			commands.push("\tSingle Insert SQL: " + sql);
				
			//2.2 Insert multiple documents into a table
			// not supported, must create sql statement to insert multiple
			
			commands.push("\n2.2: Insert multiple documents into a table. \n\tCurrently there is no support for this section");
			
			conn.prepareSync("insert into " + tableName + " VALUES " + seattle.toSQL()).executeSync().closeSync();
			conn.prepareSync("insert into " + tableName + " VALUES " + newYork.toSQL()).executeSync().closeSync();
			conn.prepareSync("insert into " + tableName + " VALUES " + london.toSQL()).executeSync().closeSync();
			conn.prepareSync("insert into " + tableName + " VALUES " + tokyo.toSQL()).executeSync().closeSync();
			conn.prepareSync("insert into " + tableName + " VALUES " + madrid.toSQL()).executeSync().closeSync();
			conn.prepareSync("insert into " + tableName + " VALUES " + melbourne.toSQL()).executeSync().closeSync();
	
			//3 Queries
			//3.1 Find one document in a table that matches a query condition
	
			commands.push("\n3 Queries");
			commands.push("3.1 Find one document in a table that matches a query condition");
			
			var condition = "population > 8000000 and code = 1";
			sql = "select * from " + tableName + " where " + condition + " limit 1";
			var result = conn.querySync(sql);
			
			commands.push("\tFirst document with: " + condition);
			commands.push("\tFirst document -> ", JSON.stringify(result));
			commands.push("\tQuery SQL: " + sql);
	
			//3.2 Find documents in a table that match a query condition
	
			commands.push("\n3.2 Find documents in a table that match a query condition");
			
			condition = "population > 8000000 and longitude > 40.0";
			sql = "select * from " + tableName + " where " + condition;
			result = conn.querySync(sql);
			
			commands.push("\tFind all documents with: " + condition);
			commands.push("\tFound Documents: ", JSON.stringify(result));
			commands.push("\tQuery All SQL: " + sql);
	
			//3.3 Find all documents in a table
	
			commands.push("\n#3.3 Find all documents in a table");
			
			sql = "select * from " + tableName;
			result = conn.querySync(sql);
			
			commands.push("\tFind all documents in table: " + tableName);
			commands.push("\tFound Documents: ", JSON.stringify(result));
			commands.push("\tFind All Documents SQL: " + sql);
	
			//3.4 Count documents with query
			
			commands.push("\n3.4 Count documents with query");
			
			condition = "longitude < 40.0";
			sql = "select count(*) from " + tableName + " where " + condition;
			result = conn.querySync(sql);
			
			commands.push("\tCount documents with: " + condition);
			commands.push("\tNumber of Documents: ", JSON.stringify(result));
			commands.push("\tCount Documents SQL: " + sql);
				
				
			//3.5 Order documents in a table
	
			commands.push("\n3.5 Order documents in a table");
			
			condition = "population";
			sql = "select * from " + tableName + " order by " + condition;
			result = conn.querySync(sql);
			
			commands.push("\tSort documents by: " + condition);
			commands.push("\tSorted documents: ", JSON.stringify(result));
			commands.push("\tOrder By SQL: " + sql);
	
			//3.6 Join tables
	
			commands.push("\n3.6 Join tables");
			
			//create another table with data
			sql = "create table if not exists " + tableJoin + " (countryCode INTEGER, countryName VARCHAR(255))";
			conn.prepareSync(sql).executeSync().closeSync();
	
			conn.prepareSync("insert into " + tableJoin + " VALUES (1,\"United States of America\")").executeSync().closeSync();
			conn.prepareSync("insert into " + tableJoin + " VALUES (44,\"United Kingdom\")").executeSync().closeSync();
			conn.prepareSync("insert into " + tableJoin + " VALUES (81,\"Japan\")").executeSync().closeSync();
			conn.prepareSync("insert into " + tableJoin + " VALUES (34,\"Spain\")").executeSync().closeSync();
			conn.prepareSync("insert into " + tableJoin + " VALUES (61,\"Australia\")").executeSync().closeSync();
			
			//join tables
			sql = "select n.city, n.population, n.longitude, n.latitude, n.code, j.countryName from " + tableName + " n inner join " + tableJoin + " j on n.code=j.countryCode";
			result = conn.querySync(sql);
			
			commands.push("\tJoin tables: " + tableName + " and " + tableJoin);
			commands.push("\tJoined Documents: ", JSON.stringify(result));
			commands.push("\tJoin SQL: " + sql);
	
			//3.7 Find distinct fields in a table
	
			condition = "longitude > 40.0";
			sql = "select distinct code from " + tableName + " where " + condition;
			result = conn.querySync(sql);
			
			commands.push("\tFind distinct with: " + condition);
			commands.push("\tDocuments found: ", JSON.stringify(result));
			commands.push("\tDistinct SQL: " + sql);
	
			//3.8 Find with projection clause
	
			commands.push("\n3.8 Find with projection clause");
			
			var projection = "city, code";
			condition = "population > 8000000";
			sql = "select distinct " + projection + " from " + tableName + " where " + condition;
			result = conn.querySync(sql);
			
			commands.push("\tFind: " + projection + " with: " + condition);
			commands.push("\tDocument found: ", JSON.stringify(result));
			commands.push("\tProjection SQL: " + sql);
	
			//4 Update documents in a table
	
			commands.push("\n4 Update documents in a table");
			
			var updatedValue = 999;
			sql = "update " + tableName + " set code = " + updatedValue + " where city  = '" + seattle.name + "'";
			conn.prepareSync(sql).executeSync().closeSync();
			
			commands.push("\tDocument to update: " + kansasCity.name);
			commands.push("\tUpdate SQL: " + sql);
	
			//5 Delete documents in a table
	
			commands.push("\n5 Delete documents in a table");
			
			sql = "delete from " + tableName + " where city like '"+ tokyo.name + "'";
			conn.prepareSync(sql).executeSync().closeSync();
			
			commands.push("\tDelete documents: " + tokyo.name);
			commands.push("\tDelete SQL: " + sql);
	
			//6 Transactions
		
			commands.push("\n6 Transactions");
			commands.push("\tStart Transaction...");
			
			//begin commit
			conn.beginTransactionSync();
			conn.prepareSync("insert into " + tableName + " VALUES " + sydney.toSQL()).executeSync().closeSync();
			conn.prepareSync("update " + tableName + " set code = 998 where city  = 'Seattle'").executeSync().closeSync();
			conn.commitTransactionSync();
			//end
			
			commands.push("\tInsert Document");
			commands.push("\tUpdate Document");
			commands.push("\tCommit Changes...");
			
			//begin rollback
			conn.beginTransactionSync();
			conn.prepareSync("delete from " + tableName + " where city like 'Sydney'").executeSync().closeSync();
			conn.rollbackTransactionSync();
			//end
			
			commands.push("\tDelete Document");
			commands.push("\tRollback...");
			commands.push("\tTransaction Complete");
	
			//7 Commands
			//7.1 Count
			
			commands.push("\n7 Commands");
			commands.push("7.1 Count");
			
			sql = "select count(*) from " + tableName;
			result = conn.querySync(sql);
			
			commands.push("\tCount documents in table: " + tableName);
			commands.push("\tNumber of documents: ", JSON.stringify(result));
			commands.push("\tCount SQL " + sql);
	
			//7.2 Distinct
	
			commands.push("\n7.2 Distinct");
			
			sql = "select distinct code from " + tableName;
			result = conn.querySync(sql);
			
			commands.push("\tFind distinct code in: " + tableName);
			commands.push("\tDocuments Found: ", JSON.stringify(result));
			commands.push("Distinct SQL: " + sql);
	
			//8 Drop a table
	
			commands.push("\n8 Drop a table");
			
			sql = "drop table " + tableName;
			conn.prepareSync(sql).executeSync().closeSync();
			
			commands.push("\tDrop table: " + tableName);
			commands.push("\tDrop Table SQL: " + sql);
			
			sql = "drop table " + tableJoin;
			conn.prepareSync(sql).executeSync().closeSync();
			
			commands.push("\tDrop table: " + tableJoin);
			commands.push("\tDrop Table SQL: " + sql);
			commands.push("\nComplete!");
	
			//print log
	//		for (var i=0; i<commands.length; i++){
	//			console.log(commands[i]);
	//		}
			
			//print browser
			app.set('view engine', 'ejs');
			res.render('index.ejs', {commands: commands});
			
		} catch (err) {
			handleError(err, res, conn);
		}	
	
	});
}

function handleError(err, res, conn) {
	console.error("error: ", err.message);
	
	// Ensure conn object gets closed
	if (conn) {
		conn.close();
	}
	
	// Display result
	commands.push("ERROR: " + err.message);
	app.set('view engine', 'ejs');
	res.render('index.ejs', {commands: commands});
	commands = [];
}

function parseVcap(){
	var serviceName = process.env.SERVICE_NAME || 'timeseriesdatabase';
	var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
	var credentials = vcap_services[serviceName][0].credentials;
	var drdaport;
	var database = credentials.db;
	var host = credentials.host;
	var username = credentials.username;
	var password = credentials.password;
	
	if (USE_SSL) {
		drdaport = credentials.drda_port_ssl;
	} else {
	    drdaport = credentials.drda_port;  
	}
      
	url = "HOSTNAME=" + host + ";PORT=" + drdaport + ";DATABASE="+ database + ";PROTOCOL=TCPIP;UID=" + username +";PWD="+ password + ";";

	if (USE_SSL){
		url += "Security=ssl";
	}
	
	return url;
}

app.get('/databasetest', function(req, res) {
	doEverything(res);
});

app.get('/', function(req, res) {
//	app.set('view engine', 'ejs');
	res.sendFile(__dirname + '/views/index.html');
});

app.listen(port,  function() {

	// print a message when the server starts listening
	console.log("Server starting on port " + port);
});

