'use strict';
// Set the oAuth parameters from .env file
module.exports = {
  
    'facebookAuth': {
        'callbackURL': process.env.BACKEND_APP_URL + 'auth/facebook/callback',
        'clientID': process.env.FACEBOOK_CLIENTID,
        'clientSecret': process.env.FACEBOOK_SECRET    
    },
    'googleAuth': {
        'callbackURL': process.env.BACKEND_APP_URL + 'api/auth/google/callback',
        'clientID': process.env.GOOGLE_CLIENTID,
        'clientSecret': process.env.GOOGLE_SECRET
    }
};