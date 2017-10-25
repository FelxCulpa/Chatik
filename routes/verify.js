const User = require('../models/user');
const pick = require('lodash/pick');


exports.get = async function(ctx, next) {
	let token = ctx.params.token;
	let verifUser = await User.findOne({token});
	

	if (!verifUser.confirmed) {
		verifUser.set({confirmed: true});
		await verifUser.save();
	} else {
		ctx.throw(404, 'You\'ve been verified');
	}

	delete verifUser.token
	await ctx.login(verifUser);
	ctx.redirect('/');

	
};

