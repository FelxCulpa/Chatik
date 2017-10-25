const mongoose = require('mongoose');
const crypto = require('crypto');
const _ = require('lodash');
const config = require('config');

const userSchema = new mongoose.Schema({
  displayName:   {
    type:     String,
    required: "Enter username"
  },
  email:         {
    type:     String,
    unique:   "This e-mail is already used",
    required: "E-mail field can't be empty",
    validate: [
      {
        validator: function checkEmail(value) {
          return this.deleted ? true : /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
        },
        msg:       'Enter correct e-mail address'
      }
    ]
  },
  deleted: Boolean,
  passwordHash:  {
    type: String
  },
  salt:          {
    type: String
  },
  gender:        {
    type: String,
    enum: {
      values:  ['male', 'female'],
      message: "Not valid value"
    }
  },
   token: {
   type: String
   },
  confirmed: {
  type: Boolean
   },

  providers: [{
    name:    String,
    nameId:  {
      type:  String,
      index: true
    },
    profile: {} 
  }]
}, {
  timestamps: true
});

userSchema.virtual('password')
  .set(function(password) {

    if (password !== undefined) {
      if (password.length < 8) {
        this.invalidate('password', 'Password should be at least 8 characters long');
      }
    }

    this._plainPassword = password;

    if (password) {
      this.salt = crypto.randomBytes(config.crypto.hash.length).toString('base64');
      this.passwordHash = crypto.pbkdf2Sync(password, this.salt, config.crypto.hash.iterations, config.crypto.hash.length, 'sha1');
    } else {
      // remove password (unable to login w/ password any more, but can use providers)
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })
  .get(function() {
    return this._plainPassword;
  });

userSchema.methods.checkPassword = function(password) {
  if (!password) return false;
  if (!this.passwordHash) return false; 

  return crypto.pbkdf2Sync(password, this.salt, config.crypto.hash.iterations, config.crypto.hash.length, 'sha1') == this.passwordHash;
};
userSchema.statics.publicFields = ['email', 'displayName', 'password'];
module.exports = mongoose.model('User', userSchema);
