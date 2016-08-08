
// Express
var express = require('express');

// Tells node that we are creating an "express" server
var app = express();

// Handlebars
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// View the public directory
app.use(express.static('public'));

// Sets an initial port. We'll use this later in our listener
var PORT = process.env.PORT || 3000; 

// body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: false
}));

// Database configuration
var mongojs = require('mongojs');
//var databaseUrl = "news";
var articles = ["scrapedData"];
var databaseUrl = "mongodb://heroku_zkwrthww:gp55nhv3shtgrb6ui7kad3piti@ds031865.mlab.com:31865/heroku_zkwrthww";

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, articles);
db.on('error', function(err) {
  console.log('Database Error:', err);
});

// Set global counter variable that is used in moving to the next object
counter=0;

// Scrape the NYTimes articles
app.get('/', function(req, res) {
	// Dependencies:
	var request = require('request'); // Snatches html from urls
	var cheerio = require('cheerio'); // Scrapes our html

	request('http://www.nytimes.com/', function (error, response, html) {

		var $ = cheerio.load(html);

		// Before inserting anything in the collection delete what's there
		//db.scrapedData.remove({});

		// an empty array to save the data that we'll scrape
		var result = [];

		$('h2.story-heading').each(function(i, element){
			
		 	var title = $(this).text().trim();
			var articles = {'title':title, comments:""};
			
			// Check if title is missing. If it is, don't insert a blank title into
			// the database.
			if (title !== "") {
				 // Insert article into mongo
				 db.scrapedData.insert(articles, function(err, saved) {
				    // show any errors
				    if (err) {
				      console.log(err);
				    } else {
				      result.push(articles);
				    }
		  		});
			}		
		});

		// Find the article to display and send the data over to handlebars
		db.scrapedData.find({}).limit(1).skip(counter, function(err,data)
		{
			res.render('index', {data});
		});
	});
	
});

// ADD COMMENT
app.post('/comment', function(req, res) {
	// set the comment variable
	var comment = req.body;
	// update the database with the new comment
	db.scrapedData.update({"_id": mongojs.ObjectId(comment.article_id)}, {$set: {comments:comment.comment}}, function(err, docs) {
		 // show any errors
		if (err) {console.log(err);}
		// Redirect to the index page
		res.redirect('/');
	});
});

// DELETE COMMENT
app.post('/delete', function(req, res) {	
	// set the delete_comment variable
	var delete_comment = req.body;
	// delete the comment from the database
	//db.scrapedData.update({"_id": mongojs.ObjectId(delete_comment.article_id)}, {$set: {comments:""}}, function(err, docs) {
	db.scrapedData.update({"_id": mongojs.ObjectId(delete_comment.article_id)}, {$set: {comments:""}}, function(err, docs) {
		if (err) {console.log(err);}
		// Redirect to the index page
		res.redirect('/');
	});
});


// MOVE TO THE NEXT OBJECT
app.get('/next', function(req, res) {	
	// Upgrade the counter
	counter++;
	// Move to the next object
	db.scrapedData.find({}).limit(1).skip(counter, function(err,data) {
		if (err) {console.log(err);}
		res.render('index', {data});
	});
});

// LISTENER
app.listen(PORT, function() {
    console.log("Listening on PORT " + PORT);
});