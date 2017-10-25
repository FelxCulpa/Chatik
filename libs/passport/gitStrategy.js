const User = require('../../models/user');
const GitHubStrategy = require('passport-github2').Strategy;
const authenticateByProfile = require('./authenticateByProfile');
const config = require('config');
const request = require('request-promise');

function UserAuthError(message) {
  this.message = message;
}

module.exports = new GitHubStrategy({
    clientID:          config.providers.github.appId,
    clientSecret:      config.providers.github.appSecret,
    callbackURL:       config.serverHost + "/oauth/git",
//    profileFields: ['id', 'bio', 'email', 'login', 'location'],
    passReqToCallback: true
  }, async function(req, accessToken, refreshToken, profile, done) {

    try {
      console.log(profile);

      let permissionError = null;
      
      if (!profile.emails || !profile.emails[0]) { 
        permissionError = "Have not access to your email adress";
      }
      if (permissionError) {
        let response = await request({
          method: 'DELETE',
          json: true,
          url: "https://api.github.com/user?access_token=" + accessToken
        });
        if (!response.success) {
          throw new Error("Github auth delete call returned invalid result " + response);
        }

        throw new UserAuthError(permissionError);
      }
      authenticateByProfile(req, profile, done);
    } catch (err) {
      console.log(err);
      if (err instanceof UserAuthError) {
        done(null, false, {message: err.message});
      } else {
        done(err);
      }
    }
  }
);