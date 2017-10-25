
const mongoose = require('mongoose');
const config = require('config');
mongoose.Promise = Promise;

 if (process.env.MONGOOSE_DEBUG) {
  mongoose.set('debug', true);
 }

mongoose.connect(config.mongoose.uri, config.mongoose.options);

module.exports = mongoose;
