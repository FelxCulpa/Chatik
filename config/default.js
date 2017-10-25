const defer = require('config/defer').deferConfig;
const path = require('path');

module.exports = {
  secret:   process.env.SECRET || 'mysecret',
  server: {
    siteHost: process.env.PORT || 'http://localhost:3000'
  },
  mongoose: {
    uri:     process.env.MONGO_URI || 'mongodb://localhost/app',
    keepAlive: 1,
    poolSize: 5
  },
  redis: {
    url: process.env.REDIS_URL,
    port: process.env.REDIS_PORT
  },
  providers: {
    facebook: {
      appId: process.env.FACEBOOKAPP || '1584514044907807',
      appSecret: process.env.FACEBOOKSECRET || 'f0f14ef63e0c6b9ec549b9b15f63a808',
      passportOptions: {
        display: 'popup',
        scope:   ['email']
      }
    },
    github: {
      appId: process.env.GITHUBAPP || '9ba7aa20baf36b0954aa',
      appSecret: process.env.GITHUBSECRET || 'd29b835e0cc61aea5503a232af67399cd40fbf11',
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


