﻿'use strict';

const FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user.js');
var configAuth = require('./oauth');
var randomstring = require('randomstring');
var nodemailer = require('nodemailer');
// var smtpTransport = require("nodemailer-smtp-transport");
var bcrypt = require('bcryptjs');

module.exports = function (passport) {
    // PassportJS serialize and deserialize functions
    passport.serializeUser(function (user, done) {
        
        // tslint:disable-next-line:no-console
        console.log('serializeUser: ' + user.id);
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            // tslint:disable-next-line:no-console
            console.log('serializeUser: ' + user);

            if (!err) {
                done(null, user);
            }else {
                done(err, null);
            };
        });
    });

   
    /*

    //Local User lost password request
    passport.use('auth/lost-password', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email and password
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },

        function (req, email, password, done) {
            // Asynchronous call for local user registration
            // User.findOne wont fire unless data is sent back
            console.log("In the local sign-up 1");

            process.nextTick(function () {
                // Find the user with email
                // we are checking to see if the user trying to login already exists
                User.findOne({ 'local_login.email': email }, function (err, user) {
                    // if there are any errors, return the error
                    if (err) {
                        // req.flash('signupMessage', 'There is a problem with the database! Error is:' + err)
                        return done(err, false);
                    }

                    // Check to see if there is already a user with that email
                    if (!user) {
                        // req.flash('signupMessage', email + ' does not exist!')
                        return done(null, false);
                    }
                    else {
                        //Create a link and generate a verification token 
                        var permalink = req.body.email.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();

                        //console.log("permalink is:", permalink);
                        var verification_token = randomstring.generate({ length: 64 });

                        // SET THE DATABASE(USER) DETAILS
                        // Hash the password and record everything at the same time to the database due to ASYNC behavior
                        const saltRounds = 10;
                        bcrypt.hash(password, saltRounds, function (err, hash) {
                            if (err) { console.log("Hashing error: ", err) }

                            // set the timestamp for verification token expiry: 10 min
                            var expiry_duration = 1 / 6 * 60 * 60 * 1000; // in miliseconds
                            var d = new Date();
                            var expiry_timestamp = d.getTime() + expiry_duration;

                            // Update user verification status
                            user.local_login.isVerified = false;
                            user.local_login.verify_token = verification_token;
                            user.local_login.verify_token_expires = expiry_timestamp;

                            // Try to save the user. If successful, send the verification email
                            try {
                                user.save(function (err) {
                                    if (err) {
                                        // req.flash('signupMessage', '*Request could not be done due to Err:' + err)
                                        return done(null, false);
                                    }
                                    else {
                                        sendEmail(req, email, verification_token, permalink, expiry_timestamp);
                                        // req.flash('signupMessage', '*Confirmation email has been successfully sent!')
                                        return done(null, user);
                                    }
                                });
                            }
                            catch (err) {
                                console.error("Error during user registration phase with error code:", err);
                            }
                        });
                    }
                });
            });
        }));




    // User sign-in protocol
    passport.use('auth/sign-in', new LocalStrategy({
            // By default, local strategy uses username and password, we will override with email and password
            usernameField: 'sign_in_email',
            passwordField: 'sign_in_password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, sign_in_email, sign_in_password, done) {
            // Asynchronous call for local user sign in
            process.nextTick(function () {
                // Find a user whose email is the same as the forms email

                User.findOne({ 'local_login.email': sign_in_email }, function (err, user) {
                    // if there are any errors, return the error
                    if (user != null) {
                        if (err) {
                            // req.flash('signinMessage', '*Sign-in could not be done due to Err:' + err)
                            return done(err, false);
                        }
                        else { // Check if password is correct
                            var password_hash = user.local_login.password;
                            bcrypt.compare(sign_in_password, password_hash, function (err, res) {
                                if (err) {
                                    // req.flash('signupMessage', '*Error:' + err)
                                    return done(err, false);
                                }

                                if (res) {
                                    if (user.local_login.isVerified === true) {
                                        return done(null, user);
                                    }
                                    else {
                                        // req.flash('signupMessage', '*Account is not verified. Reactivate account!')
                                        return done(null, false);
                                    }
                                }
                                else {
                                    // req.flash('signupMessage', '*Wrong password!')
                                    return done(null, false);
                                }
                            });
                        }
                    }
                    else {
                        // req.flash('signupMessage', 'No such account. Please sign up!')
                        return done(null, false);
                    }


                });


            });
        }
    ));

    //Google oAuth
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
    },
        function (accessToken, refreshToken, profile, done) {
            // tslint:disable-next-line:no-console
            console.log("Inside the Google sig in inside Passport.js");
            process.nextTick(function () {
                User.findOne({ 'social_login.oauthID': profile.id }, function (err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (user) {
                        return done(null, user);
                    }
                    else {
                        var newUser = new User();

                        //Initiate the user details
                        newUser.social_login.oauthID = profile.id;
                        newUser.social_login.name = profile.displayName;
                        newUser.social_login.created = Date.now();
                        newUser.stock_list = [];
                        newUser.crypto_list = [];

                        //Save the user into the database
                        newUser.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            return done(null, newUser);
                        });
                    }
                });
            });
        }
    ));


    // Facebook oAuth
    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL
    },
        function (accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                User.findOne({ 'social_login.oauthID': profile.id }, function (err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (user) {
                        return done(null, user);
                    }
                    else {
                        var newUser = new User();

                        //Initiate the user details
                        newUser.social_login.oauthID = profile.id;
                        newUser.social_login.name = profile.displayName;
                        newUser.social_login.created = Date.now();
                        newUser.stock_list = [];
                        newUser.crypto_list = [];

                        //Save the user into the database
                        newUser.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            return done(null, newUser);
                        });
                    }
                });
            });
        }
    ));
    */
};



