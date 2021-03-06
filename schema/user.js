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
    wishList: [{
        titleId: String,
        title: String,
        rating: Number,
        titleType: String,
        url: String,
    }],

});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = new mongoose.model("User",userSchema);