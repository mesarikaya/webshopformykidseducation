//Local User registration with passport-local
const User = require('../models/user');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.jwtsecret
}

// TODO: Connect the standardized validation error or success message with redux dispatch
// and share with the user

// Upon JWT strategy call this method is run
// IT get the serialized id and returns a token
module.exports = new JWTStrategy(opts, function (jwtPayload, done) {
    // tslint:disable-next-line:no-console
    console.log("JWT payload:", jwtPayload);

    try {
        User.findById({ id: jwtPayload.id }, function (err, user) {
            if (err) {
                const customErr = {
                    "message": '*JWT auth error:' + err,
                    "name": "JWT Error"
                };
                return done(customErr, false);
            }
            if (user) {
                // tslint:disable-next-line:no-console
                console.log("jwt user is:", user);

                return done(null, user);
            } else {
                const customErr = {
                    "message": '*JWT: User does not exist!',
                    "name": "JWT No Such User Error"
                };
                return done(customErr, false);
            }
        });
    } catch (MongoErr) {
        const customErr = {
            "message": 'JWT: MongoDB Connection error error:' + err,
            "name": "JWT DB Access Error"
        };
        return done(customErr, false);
    }

});