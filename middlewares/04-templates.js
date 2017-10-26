const pug = require('pug');
const config = require('config');
const path = require('path');

module.exports = async function(ctx, next) {

  const context = {};

  /* default helpers */
  context.locals = {
    get user() {
      return ctx.req.user;
    },

    get flash() {
      return ctx.flash();
    },

    lead: 'Please login and start talk',

    host: config.serverHost,
    port: config.serverPort

  };

  context.locals.csrf = function() {
    return ctx.csrf;
  };

  ctx.render = function(templatePath, locals) {
    locals = locals || {};
    const localsFull = Object.create(context.locals);

    for(const key in locals) {
      localsFull[key] = locals[key];
    }

    const templatePathResolved = path.join(config.template.root, templatePath + '.pug');

    return pug.renderFile(templatePathResolved, localsFull);
  };

  await next();

};
