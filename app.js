require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const http = require("https");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));




app.get("/", function(req, res){
  res.render("home");
});

let search = "";
app.get("/search", function(req, res){
  const options = {
  	"method": "GET",
  	"hostname": "imdb8.p.rapidapi.com",
  	"port": null,
  	"path": "/title/find?q="+encodeURI(search),
  	"headers": {
  		"x-rapidapi-key":process.env.API_KEY,
  		"x-rapidapi-host": "imdb8.p.rapidapi.com",
  		"useQueryString": true
  	}
  };
  const request = http.request(options, function (response) {
  	const chunks = [];
  	response.on("data", function (chunk) {
  		chunks.push(chunk);
  	});
  	response.on("end", function () {
  		const body = Buffer.concat(chunks);
      const searchRes = JSON.parse(body);
      //console.log(body.toString());
      //console.log(searchRes);
      res.render("search", {results : searchRes.results, search : search});
  	});
  });
  request.end();
});

app.get("/profile",function(req,res){
  res.render("profile");
});

app.get("/developers",function(req,res){
  res.render("developers");
});

app.get("/title/:titleid",function(request,response){
  titleid=request.params.titleid;

console.log(titleid);
const options = {
	"method": "GET",
	"hostname": "imdb8.p.rapidapi.com",
	"port": null,
	"path": "/title/get-overview-details?tconst="+titleid,
	"headers": {
		"x-rapidapi-key": process.env.API_KEY,
		"x-rapidapi-host": "imdb8.p.rapidapi.com",
		"useQueryString": true
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on("data", function (chunk) {
		chunks.push(chunk);
	});

	res.on("end", function () {
		const body = Buffer.concat(chunks);
    const searches=JSON.parse(body);
		console.log(body.toString());
    console.log(searches);
    response.render("title",{result:searches});
	});
});

req.end();
  
});

app.post("/search", function(req, res){
  search = req.body.search;
  console.log(search);
  res.redirect("/search");
})

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
