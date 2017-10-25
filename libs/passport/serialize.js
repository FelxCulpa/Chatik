const User = require('../../models/user');
const passport = require('koa-passport');


passport.serializeUser(function(user, done) {
  done(null, user.id); 
});

passport.deserializeUser(function(id, done) {
  User.findById(id, done); 
});
