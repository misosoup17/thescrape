var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Routes


  // First, we grab the body of the html with axios
  axios.get("http://www.news.google.com").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    $("article").each(function (i, element) {
      var result = {};

      result.title = $(this)
        .children("h4")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      db.article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  });

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  db.article.find()
    .then(function (dbPopulate) {
      res.json(dbPopulate);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  db.article.findById(req.params.id)
    .populate("note")
    .then(function (dbPopulate) {
      res.json(dbPopulate);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbPopulate) {

      return db.article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbPopulate._id } }, { new: true });
    })
    .then(function (dbPopulate) {
      res.json(dbPopulate);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});