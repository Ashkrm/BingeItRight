const commentSchema = new mongoose.Schema({
  titleId : String,
  username : String,
  date : String,
  body : String,
  upvotes : Number,
  downvotes : Number
});

exports = new mongoose.model("Comment", commentSchema);
