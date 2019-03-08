//Local User registration with passport-local
const User = require('../models/user');
const randomstring = require('randomstring');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const HandleSubscription = require('../config/commonfunctions/handleSubscription');

// TODO: Connect the standardized validation error or success message with redux dispatch
// and share with the user

module.exports = new LocalStrategy({
        passReqToCallback: true, // allows us to pass back the entire request to the callback,
        passwordField: 'password',
        session: false,
        usernameField: 'email'
    }, (req, email, password, done) => {
        // Convert email to lowercase
        email = email.toLowerCase().trim();

        process.nextTick(function () {

            const handleSubscription = new HandleSubscription();

            // Check if the user exists
            User.findOne({ 'local_login.email': email}, (err, user) => {
                // if there are any errors, return the error
                if (err) {
                    // Share the err status that occured due to mongoDB server or setup related issues
                    return done(err, false);
                }

                // If user exists share a custom error
                if (user) {
                    // Share user exists Error code
                    const customErr = { "name": "MongoError", "code": 11000 };
                    return done(customErr, false);
                }
                else {// For new user

                    var verificationToken = randomstring.generate({ length: 64 });

                    // Try to send an email to the user to see if email exists
                    try {
                        // Send subscription confirmation email to the user
                        handleSubscription.sendEmail(req, email, verificationToken);

                        // Create the user
                        // tslint:disable-next-line:no-console
                        console.log("NOW SAVE: ");
                        var newUser = new User();

                        const saltRounds = 10;
                        // SET THE DATABASE(USER) DETAILS
                        // Hash the password and record everything at the same time to the database due to ASYNC behavior
                        handleSubscription.encryptUserInfo(req, done, email, password, verificationToken, saltRounds, newUser);
                    } catch (subscriptionError) {
                        // tslint:disable-next-line:no-console
                        console.log("Subscription error: ", subscriptionError);
                        return done(subscriptionError, false);
                    }
                }
            });
        });
});


