const findOrCreate = require('mongoose-findorcreate');
const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const commentSchema = new mongoose.Schema({
  titleId : String,
  username : String,
  date : String,
  body : String,
  upvotes : Number,
  downvotes : Number
});

module.exports = new mongoose.model("Comment", commentSchema);
