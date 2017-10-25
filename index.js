const Koa = require('koa');
const app = new Koa();

const config = require('config');
const mongoose = require('./libs/mongoose');

app.keys = [config.secret];

const path = require('path');
const fs = require('fs');

const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();

middlewares.forEach(function(middleware) {
  app.use(require('./middlewares/' + middleware));
});

const Router = require('koa-router');

const router = new Router();

router.get('/', require('./routes/frontpage').get);
router.post('/login', require('./routes/login').post);
router.post('/logout', require('./routes/logout').post);

const passport = require('koa-passport');

// login
router.get('/login/facebook', passport.authenticate('facebook', config.providers.facebook.passportOptions));
// connect with existing profile
router.get('/connect/facebook', passport.authorize('facebook', config.providers.facebook.passportOptions));

router.get('/oauth/facebook', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/',
  failureFlash: true // 
}));
router.get('/login/git', passport.authenticate('github', config.providers.github.passportOptions));

router.get('/connect/git', passport.authorize('github', config.providers.github.passportOptions));

router.get('/oauth/git', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/',
  failureFlash: true // 
}));
router.get('/signup', require('./routes/registration').get);
router.post('/signup', require('./routes/registration').post);
router.get('/verify/:token', require('./routes/verify').get);

app.use(router.routes());

const socket = require('./libs/socket');
const server = app.listen(config.get('port'));
socket(server);
