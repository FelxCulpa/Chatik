const passport = require('koa-passport');
const User = require('../models/user');
const pick = require('lodash/pick');
const oid = require('../libs/oid');
const sendMail = require('../libs/sendMail');
const config = require('config');

exports.get = async function(ctx, next) {
	ctx.body = ctx.render('registration');
};

exports.post = async function(ctx, next) {
	let auth = {token: oid(ctx.request.body.displayName),
			confirmed: false};
	let userBody = Object.assign(auth, pick(ctx.request.body, User.publicFields));
	let user = new User(userBody);
	
	try {
		 await user.save();
		} catch(e) {
		 if (e.name == 'ValidationError') {
	      let errorMessages = "";
	      for(let key in e.errors) {
	        errorMessages += `${key}: ${e.errors[key].message}<br>`;
	      }
	      ctx.flash('error', errorMessages);
	      ctx.redirect('/signup');
	      return;
	    } else {
	      ctx.throw(e);
    }
  }	
    let letter = await sendMail({
		template:     'hello',
		subject:      'Verification',
		to:           user.email,
		name:         user.displayName,
		token:        user.token,
		siteURL: config.serverHost + config.serverPort
		});
	ctx.body = "Please confirm your email address to finish your Registration";
};
