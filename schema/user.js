const findOrCreate = require('mongoose-findorcreate');
const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const userSchema= new mongoose.Schema({
	email:String,
	password:String,
	googleId: String,
    username: String,
    firstName: String,
    lastName: String,
    watchList: [{
        titleId: String,
        title: String,
    }],

});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = new mongoose.model("User",userSchema);