const db_util = require('./db_util/util.js');
const sysMsg = require('./db_util/sys_msg.js');

const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const redisStore = require('connect-redis')(session);
const app = express();
const router = express.Router();

const listeningPort = 3000;
const secretToken = 'qweasdzxciopjklbnm';

app.use('/', router);

app.listen(process.env.PORT || listeningPort, () => {
	console.log(`app is listening at port ${listeningPort}`);
});

router.use(bodyParser());

router.use(session({
	store: new redisStore(),
	secret: secretToken,
	cookie: {maxAge: 60 * 1000}
}));

router.get('/', (req, res) => {
	
	if (req.session.userId && req.session.userId !== '') {
		db_util.getUserInfoByUserId(req.session.userId)
			.then((result) => {
				if (result.msg === sysMsg.success) {
					fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, data) => {
						if (err) {
							throw err;
							res.status(500);
						}
						data = data.replace('${name}', result.user.username);
						res.status(200);
						res.type('html');
						res.send(data);
						res.end();
					})
				} else {
					res.redirect('/login');
				}	
			})
			.catch((err) => {
				console.error(err);
				res.status(500);
			});
	} else {
		res.redirect('/login');
	}
})

let loginPageCache = '';

router.get('/login', (req, res) => {
	fs.readFile(path.join(__dirname, 'public', 'login.html'), 'utf8', (err, data) => {
		if (err) {
			throw err;
			res.status(500);
		}
		loginPageCache = data;
		if (req.session.userId) {
			req.session.userId = '';
		}
		data = data.replace('${errorMsg}', '');
		res.status(200);
		res.type('html');
		res.send(data);
		res.end();
	})
})


router.post('/api/login', (req, res) => {
	db_util.checkPasswd(req.body.username, req.body.password)
		.then((result) => {
			if (result.msg === sysMsg.success) {
				req.session.userId = result.userId;	
				console.log('success');
				res.redirect('/');
			}	else {
				let errMsg = '';
				switch(result.msg) {
					case sysMsg.noUserError:
						errMsg = 'no such user!';
						break;
					case sysMsg.passwordWrongError:
						errMsg = 'password wrong!';
						break;
				}
				if (loginPageCache !=='') {
					let data = loginPageCache;
					data = data.replace('${errorMsg}', `<p style="color: red">${errMsg}<\p>`);
					res.type('html');
					res.send(data);
					res.end();
				}
			}	
		})
		.catch((err) => {
			console.error(err);
			res.status(500);
		})
})

let signinPageCache = "";

router.get('/signin', (req, res) => {
	fs.readFile(path.join(__dirname, 'public', 'signin.html'), 'utf8', (err, data) => {
		if (err) {
			throw err;
			res.status(500);
		}
		if (req.session.userId) {
			req.session.userId = "";
		}
		res.status(200);
		res.type('html');
		signinPageCache = data;
		data = data.replace('${errMsg}', '');
		res.send(data);
		res.end();
	})
})

router.post('/api/signin', (req, res) => {
	db_util.isUserExist(req.body.username)
		.then((result) => {
			if (result.msg === sysMsg.userAlreadyExist) {
				let data = '';
				if (signinPageCache !== '') {
					data = signinPageCache;
				}	
				data = data.replace('${errMsg}', '<p style="color: red">username already exist!</p>');
				res.status(200);
				res.send(data);
				res.end();
			} else {
				return db_util.createNewUser(req.body.username, req.body.password);
			}
		})
		.then((result) => {
			req.session.userId = result.userId;
			res.redirect('/');	
		})
		.catch((err) => {
			console.error(err);
			res.status(500);
		})
})

