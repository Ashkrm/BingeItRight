require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const http = require("https");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const changeSettings = require(__dirname + '/utilities/changeSettings');
const changePassword = require(__dirname + '/utilities/changePassword');
const updateWatchlist = require(__dirname + '/utilities/updateWatchlist');
const seeWatchList = require(__dirname+'/utilities/seeWatchList');
const remove = require(__dirname + '/utilities/remove');
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

mongoose.connect("mongodb://localhost:27017/bingeDB",{ useNewUrlParser: true,useUnifiedTopology: true });
mongoose.set("useCreateIndex",true);

const authfunc = function(req, res, next) {
  req.authCustom = {};
  if (req.isAuthenticated()) {
    req.authCustom.auth = true;
    req.authCustom.username = req.user.username;
    req.authCustom.firstName = "";
    req.authCustom.lastName = "";
    if(!req.user.firstName){
     req.authCustom.firstName = "";
     req.authCustom.lastName = "";
   }else{
     req.authCustom.firstName = req.user.firstName;
     req.authCustom.lastName = req.user.lastName;
   }
  } else {
    req.authCustom.auth = false;
    req.authCustom.username = undefined;
  }
  next();
};
app.use(authfunc);

const User = require(__dirname+ '/schema/user');

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
	done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
	  done(err, user);
	});
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SERVER,
    callbackURL: "http://localhost:3000/auth/google/bingeIt",
	userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
	      User.findOrCreate({ googleId: profile.id, username: profile.displayName }, function (err, user) {
      return cb(err, user);
    });
  }
));

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
      res.render("search", {results : searchRes.results, search : search});
  	});
  });
  request.end();
});

app.get("/profile",function(req,res){
		if (req.isAuthenticated()) {
		  res.render("profile", {
			username: req.authCustom.username,
			auth: req.authCustom.auth,
			user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
		  });
		} else {
		  const h = "You need to log in to your account first!"
		  const pm = "Click On 'Sign in' provided In Navigation Bar";
		  res.render("respond", {
			h: h,
			pm: pm,
			auth: req.authCustom.auth,
			user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName}
		  })
		}
	  
});

app.get('/seeWatchList', seeWatchList);
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
   response.render("title",{result:searches});
	});
});

req.end();

});
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
  );

  app.get("/auth/google/bingeIt", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect('/profile');
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
app.post('/changeSettings', changeSettings);
app.post("/changePassword", changePassword);
app.post("/updateWatchlist", updateWatchlist);
app.post("/remove", remove);

app.post("/search", function(req, res){
  search = req.body.search;
  console.log(search);
  res.redirect("/search");
})

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
