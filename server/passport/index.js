const jwtStrategy = require('./jwt-auth');
const localSigninStrategy = require('./local-signin');
const User = require('../models/user'); 
const localSignupStrategy = require('./local-signup');
const googleStrategy = require('./social-sign');

// Called on login, saves the id and returns with the localstorage token
module.exports = function (passport) {

    // PassportJS serialize functions
    passport.serializeUser(function (user, done) {
        // tslint:disable-next-line:no-console
        console.log('in Serialize user ');
        // tslint:disable-next-line:no-console
        console.log('serializeUser: ' + user.id);
        done(null, user.id);
    });

    // User object attaches to the request as req.user
    // PassportJS  deserialize function
    passport.deserializeUser(function (id, done) {
        // tslint:disable-next-line:no-console
        console.log('in Deserialize user ');
        User.findById(id, function (err, user) {

            // tslint:disable-next-line:no-console
            console.log('DeserializeUser: ' + user);
            if (!err) {
                done(null, user);
            } else {
                done(err, null);
            };
        });
    });

    /** LOAD PASSPORT STRATEGIES */
    /** Local sign up strategies */
    passport.use('local-signup', localSignupStrategy);
    passport.use('local-signin', localSigninStrategy);
    passport.use('jwt-auth', jwtStrategy);

    // TODO: ADD SOCIAL SIGNIN Strategies
    passport.use('google', googleStrategy);
}
