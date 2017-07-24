const mongoose = require('./mongodb_config.js').mongoose;
const UserSchema = require('./mongodb_config.js').UserSchema;
const UserModel = require('./mongodb_config.js').UserModel;
const sysMsg = require('./sys_msg.js');
const bcrypt = require('bcrypt-nodejs');


const isUserExist = function(username) {
	return new Promise((resolve, reject) => {
		UserModel.findOne({username: username}, (err, user) => {
			if (err) {
				reject({err:err, msg: 'error happen when checking whether user is existing'});
			}
			if (user) {
				resolve({msg: sysMsg.userAlreadyExist});
			} else {
				resolve({msg: sysMsg.success});
			}
		})
	})
}

const createNewUser = function(username, password) {
	return new Promise((resolve, reject) => {
		let newUser = new UserModel({
			username: username,
			password: bcrypt.hashSync(password),
			userId: bcrypt.hashSync(username)
		})
		newUser.save((err, user) => {
			if (err) {
				reject({err:err, msg: 'error happen when save new user info to db'});
			}
			resolve({msg: sysMsg.success, userId: user.userId});
		});
	});
};


const getUserInfoByUserId = function(userId) {
	return new Promise((resolve, reject) => {
		UserModel.findOne({userId: userId}, (err, user) => {
			if (err) {
				reject({err: err, msg: 'error happen when get user info by user id'});
			}
			if (user) {
				resolve({msg: sysMsg.success, user: user});
			} else {
				resolve({msg: sysMsg.userIdError});
			}
		});
	});
};

const checkPasswd = function(username, password) {
	return new Promise((resolve, reject) => {
		UserModel.findOne({username: username}, (err, user) => {
			if(err) {
				reject({err: err, msg: 'error happen when checking whether user password is right'});
			}
			if(!user) {
				resolve({msg:sysMsg.noUserError});
			}else if(bcrypt.compareSync(password, user.password)) {
				resolve({msg: sysMsg.success, userId: user.userId});
			} else {
				resolve({msg: sysMsg.passwordWrongError});
			}
		})
	})
}

module.exports = {
	isUserExist,	
	createNewUser,
	getUserInfoByUserId,
	checkPasswd,
}
