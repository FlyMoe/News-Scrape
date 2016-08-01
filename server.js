
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
var databaseUrl = "news";
var articles = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on('error', function(err) {
  console.log('Database Error:', err);
});


// Scrape the NYTimes articles
app.get('/', function(req, res) {
	// Dependencies:
	var request = require('request'); // Snatches html from urls
	var cheerio = require('cheerio'); // Scrapes our html

	request('http://www.nytimes.com/', function (error, response, html) {

		var $ = cheerio.load(html);

		// an empty array to save the data that we'll scrape
		var result = [];
		$('h2.story-heading').each(function(i, element){
			//result.push($(this).text());
		 // save the request body as an object called scraped
		  var scraped = {'title':$(this).text(), 'summary':$('p.summary').text()};
		  console.log("Scraped:" +scraped.title);
		  console.log("summary:" +scraped.summary);
		  // Insert scraped object, since it's already an object
		  res.render('index', {scraped: scraped});
		});

		

		  // db.scrapedData.insert(scraped, function(err, saved) {
		  //   // show any errors
		  //   if (err) {
		  //     console.log(err);
		  //   } else {
		  //     // otherwise, send the response to the client (for AJAX success function)
		  //     console.log(saved);
		  //     //res.send(saved);
		  //   }
		  // });

		
	});
	
});


// SUBMIT COMMENT
app.post('/submit', function(req, res) {
	// store the comment object in a variable
	var comment = req.body;
	console.log(comment.comment, comment.posted, comment.article_id);
	// update the database with the new comment
	db.articles.update({"_id": (mongojs.ObjectId(comment.article_id))}, {$addToSet: {comments: {comment: comment.comment, posted: comment.posted}}}, function(err, docs) {
		console.log(docs);
	}); // end db.articles.update()
}); // end app.get('/submit')

// DELETE COMMENT
app.post('/delete', function(req, res) {	
	// set the comment to delete details in a variable
	var delete_comment = req.body;
	// delete the comment form the database
	db.articles.update({"_id": (mongojs.ObjectId(delete_comment.article_id))}, {$pull: {comments: {posted: delete_comment.posted}}}, function(err, docs) {
		console.log(docs);
	}); // end db.articles.update()
}); // end app.post('/delete')


// LISTENER
app.listen(PORT, function() {
    console.log("Listening on PORT " + PORT);
});