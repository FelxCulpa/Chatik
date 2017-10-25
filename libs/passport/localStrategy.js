let passport = require('koa-passport');
let LocalStrategy = require('passport-local');
let User = require('../../models/user');


module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true 
  },

  function(req, email, password, done) {
    User.findOne({ email }, function(err, user) {
      if (err) {
        return done(err);
      }

      
      if (!user || !user.checkPassword(password)) {
        if (!user.confirmed) {
        return done(null, false, { message: 'Please verify your e-mail adress' });
        }
        return done(null, false, { message: 'User doesn\'t exist' });
      }
      return done(null, user);
    });
  }
);
