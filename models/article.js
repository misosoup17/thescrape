var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },

  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var article = mongoose.model("article", ArticleSchema);

// Export the Article model
module.exports = article;