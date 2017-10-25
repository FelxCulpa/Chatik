const defer = require('config/defer').deferConfig;
const path = require('path');

module.exports = {
  secret:   process.env.SECRET,
  serverPort:   process.env.PORT,
  serverHost: process.env.HOST,
  mongoose: {
    uri:     process.env.MONGO_URI,
    keepAlive: 1,
    poolSize: 5,
    useMongoClient: true
  },
  redis: {
    url: process.env.REDISCLOUD_URL
  },
  providers: {
    facebook: {
      appId: process.env.FACEBOOKAPP,
      appSecret: process.env.FACEBOOKSECRET,
      passportOptions: {
        display: 'popup',
        scope:   ['email']
      }
    },
    github: {
      appId: process.env.GITHUBAPP,
      appSecret: process.env.GITHUBSECRET,
      passportOptions: {
          display: 'popup',
          scope: ['email']
        }
    }
  },
   mailer: {
    transport: 'gmail',
    gmail: {
      user: process.env.EMAIL,
      password: process.env.EMAILPASS
    },
    senders:  {
      default:  {
        fromEmail: process.env.EMAIL,
        fromName:  'Floppy\'s Chatik',
        signature: "<em>Best regards,<br>FLoppy</em>"
      }
    }
  },
  crypto: {
    hash: {
      length:     128,
      iterations: process.env.NODE_ENV == 'production' ? 12000 : 1
    }
  },
  template: {
    // template.root uses config.root
    root: defer(function(cfg) {
      return path.join(cfg.root, 'templates');
    })
  },
  root:     process.cwd()
};


