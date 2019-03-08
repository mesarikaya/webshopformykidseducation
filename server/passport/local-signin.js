//Local User registration with passport-local

const User = require('../models/user');
const randomstring = require('randomstring');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require("jsonwebtoken");

// TODO: Connect the standardized validation error or success message with redux dispatch
// and share with the user

// Local user sign in passport strategy function
// On function call it checks hashcode password validity
module.exports = new LocalStrategy({
    passReqToCallback: true, // allows us to pass back the entire request to the callback,
    passwordField: 'password',
    session: false,
    usernameField: 'email',
    
}, (req, signInEmail, signInPassword, done) => {
    // Convert email to lowercase
    signInEmail = signInEmail.toLowerCase().trim();

    // Asynchronous call for local user sign in
    process.nextTick(function () {

        User.findOne({ 'local_login.email': signInEmail }, (err, user) => {

            // if there are any errors, return the error
            if (user != null) {
                if (err) {
                    const customErr = {
                        "message": '*Sign-in could not be done due to Err:' + err,
                        "name": "Signin Error"
                    };
                    return done(customErr, false);
                }
                else { // Check if password is correct
                    const passwordHash = user.local_login.password;
                    bcrypt.compare(signInPassword, passwordHash, function (encryptionErr, res) {
                        if (encryptionErr) {
                            const customErr = {
                                "message": '*Sign-in could not be done due to Err:' + encryptionErr,
                                "name": "Signin Error"
                            };
                            return done(customErr, false);
                        }

                        if (res) {
                            if (user.local_login.isVerified === true) {
                                // Sign in the user with expiry time setup
                                const successMsg = {
                                    "message": '*Sign-in successfull!',
                                    "name": "Signin Successfull",
                                };

                                const payload = {
                                    id: user.local_login.email,
                                };

                                // tslint:disable-next-line:no-console
                                console.log("JWT env secret is is? -->", process.env.jwtsecret);
                                jwt.sign(payload, process.env.jwtsecret, {
                                    expiresIn: 6*60*10
                                }, (jwtSignErr, token) => {
                                    // tslint:disable-next-line:no-console
                                    console.log("JWT Token is? -->", token);

                                    if (jwtSignErr) {
                                        const customErr = {
                                            "message": '*Error in JWT token:' + jwtSignErr,
                                            "name": "Signin Error"
                                        };
                                        return done(customErr, false);
                                    }
                                    else {
                                        return done(null, user, token);
                                    }
                                });
                            }
                            else { // User is not verified
                                const customErr = {
                                    "message": '*Account is not verified!.' +
                                        'Request account verification or click on the link sent in the confirmation email.',
                                    "name": "Signin Error"
                                };
                                return done(customErr, false);
                            }
                        }
                        else { // Password is incorrect, no result document is found after the query
                            const customErr = {
                                "message": '*Wrong Password!.',
                                "name": "Signin Error"
                            };
                            return done(customErr, false);
                        }
                    });
                }
            }
            else { // User does not exist
                const customErr = {
                    "message": '*No such account. Please sign up!',
                    "name": "Signin Error"
                };
                return done(customErr, false);
            }
        });
    });
});