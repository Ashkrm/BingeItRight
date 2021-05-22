require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const http = require("https");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
	secret:'this is our project',
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/bingeDB",{ useNewUrlParser: true });
mongoose.set("useCreateIndex",true);
const userSchema= new mongoose.Schema({
	email:String,
	password:String,
	user_name:String,
	firstname:String,
	lastname:String
});
userSchema.plugin(passportLocalMongoose);

const User= new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
	if(req.isAuthenticated())
      res.render("profile");
	  else
	  res.redirect("/login");
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
		//console.log(body.toString());
    //console.log(searches);
    response.render("title",{result:searches});
	});
});

req.end();

});
app.get("/login",function(req,res){
	res.render("login");
})
app.get("/register",function(req,res){
	res.render("register");
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
})

app.post("/register",function(req,res){
	User.register({username:req.body.username},req.body.password,function(err,user){
		if(err)
		{
			console.log(err);
			res.redirect("/register");
		}
		else
		{
			passport.authenticate("local")(req,res,function(){
				res.redirect("/profile");
			});
		}
	});
});

app.post("/login",function(req,res){
	const user=new User({
		username:req.body.username,
		password:req.body.password
		
	});
	req.login(user,function(err){
		if(err)
		{
			console.log("galt")
			console.log(err);
			res.redirect("/login");
		}
		else
		{
			passport.authenticate("local")(req,res,function(){
				res.redirect("/profile");
			})
		}
	});
});
app.post("/search", function(req, res){
  search = req.body.search;
  console.log(search);
  res.redirect("/search");
})

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
