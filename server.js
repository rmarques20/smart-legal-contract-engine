const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const validator = require('express-validator');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

const userModel = require('./models/user.model');

global.secure = function(type) {
	return function (request, response, next) {
		if (request.isAuthenticated()) {
			if (type) {
				if (type === request.user.type) {
					return next();
				}else{
					response.render('401');
				}
			}else{
				return next();
			}			
		}
		response.render('401');
	}
};


const index = require('./routes/index.route');
const routerForm = require('./routes/form.route');
const userContract = require('./routes/contract.route');
const login = require('./routes/login.route');
const logout = require('./routes/logout.route');
const signup = require('./routes/signup.route');
const profile = require('./routes/profile.route');
const download = require('./routes/download.route');

app.use(validator());
app.use(express.json(), express.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.use(session({
    secret: 'someRandomSecretKey',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (email, callback) {
    callback(null, email);
});

passport.deserializeUser(function (email, callback) {
    userModel.read(email, function (data) {
        callback(null, data);
    })
});

app.listen(8080, () => {
    console.log(`Visit me at 8080`);
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(function (request, response, next) {
    response.locals.user = request.user;
    response.locals.isAuthenticated = request.isAuthenticated();
    next();
})

app.use('/public', express.static('public'));

app.use('/', index);
app.use('/signup', signup);
app.use('/login', login);
app.use('/logout', logout);
app.use('/user', userContract);
app.use('/form', routerForm);
app.use('/profile', profile);
app.use('/download', download);

app.use(function (req, res) {
    res.status(404).render('404');
});