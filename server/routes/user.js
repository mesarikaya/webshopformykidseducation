
// Ingest the User controller
const UserController = require(process.cwd() + '/server/controllers/user_controller.js');
const HandleSubscription = require('../config/commonfunctions/handleSubscription');
const ErrorHandler = require('../config/commonfunctions/errorHandling');
const SocialAuthHandler = require('../passport/social-sign');
const jwt = require("jsonwebtoken");
// const passport = require('../passport');

// Create the routes for user account calls
module.exports = (router, passport) => {

    // tslint:disable-next-line:no-console
    console.log("In user routing module");
    const userController = new UserController();
    const handleSubscription = new HandleSubscription();
    const errorHandler = new ErrorHandler();
    const socialAuthHandler = new SocialAuthHandler();


    // Create authentication check via using passport.js    
    function ensureAuthenticated(req, res, next) {

        // tslint:disable-next-line:no-console
        console.log("Authentications result is:", req.isAuthenticated());
        if (req.isAuthenticated()) {
            // If authentrication is successfull, do the next action
            return next();
        }
        else {
            // Warn the user about logged out status, and redirect to cover page
            // tslint:disable-next-line:no-console
            console.log("Authentication failed");
            res.redirect('/');
        }
    }

    // On page refresh route
    router
        .route('/auth')
        .get((req, res, next) => {

            // Check if the user is available in the header
            // tslint:disable-next-line:no-console
            // console.log(req.user)
            if (req.user) {
                res.json({ user: req.user })
            } else {
                res.json({ user: null })
            }
        });

    // CREATE AUTHENTICATIONS FOR Local Sign in
    // Set created authenticate
    // After sign up request, direct to home page for login
    router
        .route('/api/auth/sign-up')
        .post((req, res, next) => {
            return passport.authenticate('local-signup', (err, user) => {
                const result = errorHandler.sendErrorDetails(err, res);

                if (result.success) {
                    return res.status(200).json({
                        result: {
                            message: "Success! Verification email is sent",
                            status: "success"
                        }
                    });
                } else {
                    return res.status(400).json({
                        result: {
                            message: result.message,
                            status: "error"
                        }
                    });
                }


            })(req, res, next);
        });

    // Verify the user and redirect to startpage in case of success. In case of error send error.
    router
        .route('/verify')
        .get((req, res) => {
            handleSubscription.verifyEmail(req, res);
        });

    // User sign-in
    router
        .route('/auth/sign-in')
        .post((req, res, next) => {
            return passport.authenticate('local-signin', (err, user, token) => {
                // Check if the user credentials are correct. 
                // If so, send the user verification result JSON to update the app state

                // Log in to the session and serialize the user
                req.logIn(user, function (loginErr) {
                    if (loginErr) {
                        return res.status(500).json({ message: "Login failed with error => " + loginErr });
                    }

                    // tslint:disable-next-line:no-console
                    console.log("Token is:", token);

                    const result = errorHandler.sendErrorDetails(err, res);
                    if (result.success) {

                        // tslint:disable-next-line:no-console
                        console.log("JWT authenticated? and user -->", user);

                        return res.status(200).json({
                            result: {
                                favorites: user.favorites,
                                message: "User signed in",
                                shoppingBasket: user.shoppingBasket,
                                token: token,
                                userVerified: user.local_login.isVerified,
                                username: user.local_login.email
                            }
                        });

                    } else {
                        return res.status(400).json({
                            result: {
                                message: result.message,
                                status: "error"
                            }
                        });
                    }
                });

            })(req, res, next);
        });

    // LOGOUT - After logout go back to opening page
    router
        .route('/auth/sign-out')
        .get((req, res) => {
                req.logOut();
                
                // tslint:disable-next-line:no-console
                console.log("Logging out from the user session2", req.session);
                
                return res.status(200).json({
                    "result": {
                        "message": "User signed out!",
                        "username": "guest"
                    }
                });
        });

    // TODO: LOST PASSWORD route
    router
        .route('/auth/lost-password')
        .post(passport.authenticate('auth/lost-password', {
                failureRedirect: '/',
                successRedirect: '/',
            })
        );


    // After successful login creates the token and saves the user if it does not exist
    router
        .route('/auth/google')
        .post((req, res) => {
            const profile = {
                id: req.body.profileObj.googleId,
                name: req.body.profileObj.name
            };

            if (typeof profile.id === "undefined" || typeof profile.name === "undefined") {
                return res.status(400).json({
                    result: {
                        message: "Login action iscanceled by the user",
                        status: "error"
                    }
                });
            } else {
                // tslint:disable-next-line:no-console
                console.log("INSIDE GOOGLE CALLBACK", req.body.profile);
                socialAuthHandler.socialSignIn(res, profile);
            }

        });

    // Google callback call
    router
        .route('/auth/google/callback')
        .get(passport.authenticate('google', { failureRedirect: '/', successRedirect: '/' }),
        function (req, res) {
                // tslint:disable-next-line:no-console
                console.log("Google sign in success");
                // res.redirect('/');
            }
        );

    // TODO: FACEBOOK AUTHENTICATE   
    router
        .route('/auth/facebook')
        .post((req, res) => {
            const profile = {
                id: req.body.userID,
                name: req.body.name
            };


            if (typeof profile.id === "undefined" || typeof profile.name === "undefined") {
                return res.status(400).json({
                    result: {
                        message: "Login action iscanceled by the user",
                        status: "error"
                    }
                });
            } else{
                // tslint:disable-next-line:no-console
                console.log("INSIDE FACEBOOK CALLBACK", req.body.userID);
                socialAuthHandler.socialSignIn(res, profile);
            }

        });

    // Facebook callback call
    router
        .route('/auth/facebook/callback')
        .get(passport.authenticate('facebook', { failureRedirect: '/' }),
            function (req, res) {
                // tslint:disable-next-line:no-console
                console.log("FB sign in success");
                // res.redirect('/');
            }
    );

    // Add the image to user favorites
    router
        .route('/modifyFavorites')
        .post   (function (req, res) {
            userController.modifyFavorites(req, res);
        });

    // Add the image to user favorites
    router
        .route('/modifyShoppingBasket')
        .post(function (req, res) {

            userController.modifyBasket(req, res);
        });
};