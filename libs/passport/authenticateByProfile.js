const User = require('../../models/user');
const config = require('config');
const co = require('co');
const request = require('request-promise');

function UserAuthError(message) {
  this.message = message;
}

module.exports = async function(req, profile, done) {
  const userToConnect = req.user;
  const providerNameId = makeProviderId(profile);   // "facebook:123456"
  let user;

  if (userToConnect) {
    const alreadyConnectedUser = await User.findOne({
      "providers.nameId": providerNameId,
      _id:                {$ne: userToConnect._id}
    });

    if (alreadyConnectedUser) {
      for (let i = 0; i < alreadyConnectedUser.providers.length; i++) {
        const provider = alreadyConnectedUser.providers[i];
        if (provider.nameId == providerNameId) {
          provider.remove();
          i--;
        }
      }
      await alreadyConnectedUser.save();
    }

    user = userToConnect;

  } else {
    user = await User.findOne({"providers.nameId": providerNameId});

    if (!user) {
      user = await User.findOne({email: profile.emails[0].value});
      if (!user) {
        // auto-register
        user = new User();
      }
    }
  }

  mergeProfile(user, profile);

  try {
    await user.validate();
  } catch (e) {
    console.log(e);
    throw new UserAuthError("Not enough information");
  }
  try {
    await user.save();
    done(null, user);
  } catch (err) {
    if (err instanceof UserAuthError) {
      done(null, false, {message: err.message});
    } else {
      done(err);
    }
  }
};



function mergeProfile(user, profile) {
  if (!user.photo && profile.photos && profile.photos.length && profile.photos[0].type != 'default') {
    user.photo = profile.photos[0].value;
  }

  if (!user.email && profile.emails && profile.emails.length) {
    user.email = profile.emails[0].value;
  }

  if (!user.displayName && profile.displayName) {
    user.displayName = profile.displayName;
  }

  if (!user.realName && profile.realName) {
    user.realName = profile.realName;
  }

  if (!user.gender && profile.gender) {
    user.gender = profile.gender;
  }

  const nameId = makeProviderId(profile);
  for (let i = 0; i < user.providers.length; i++) {
    const provider = user.providers[i];
    if (provider.nameId == nameId) {
      provider.remove();
      i--;
    }
  }

  user.providers.push({
    name:    profile.provider,
    nameId:  makeProviderId(profile),
    profile: profile
  });

  user.verifiedEmail = true;
}

function makeProviderId(profile) {
  return profile.provider + ":" + profile.id;
}
