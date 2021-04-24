require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const http = require("https");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res){
  res.render("home");
})

app.get("/profile",function(req,res){
  res.render("profile");
});

app.get("/developers",function(req,res){
  res.render("developers");
});

app.post("/", function(req, res){
  var search = req.body.search;
  console.log(search);
})

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
