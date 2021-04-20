require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const http = require("https");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res){
  res.sendFile(__dirname+"/home.html");
})

app.post("/", function(req, res){
  var search = req.body.search;
  console.log(search);
})

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
