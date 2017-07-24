const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/homework");
mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
	username: String,
	password: String,
	userId: String,
})

const UserModel = mongoose.model('user', UserSchema);

module.exports = {
	mongoose,
	UserSchema,
	UserModel
}
