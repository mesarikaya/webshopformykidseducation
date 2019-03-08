// Google Sign in and sign u
const User = require('../models/user');
const jwt = require("jsonwebtoken");

// Functions to handle the error communications
function handleSocialSignIn() {

    // Google succcess function
    this.socialSignIn = (res, profile) => {

        const payload = {
            id: profile.id,
        };

        // Asynchronous call for google user sign in
        // tslint:disable-next-line:no-console
        console.log("Profile is:", profile);
        process.nextTick(function () {
            User.findOne({ 'social_login.oauthID': profile.id}, function (err, user) {
                if (err) {
                    return {
                        error: "DB Error",
                        message: "Error: " + err,
                        success: false
                    };
                }

                // tslint:disable-next-line:no-console
                console.log("JWT env secret is is? -->", process.env.jwtsecret);
                jwt.sign(payload, process.env.jwtsecret, {
                    expiresIn: 6 * 60 * 10
                }, (jwtSignErr, token) => {
                    // tslint:disable-next-line:no-console
                    console.log("JWT Token is? -->", token);

                    if (jwtSignErr) {
                        return {
                            error: "JWT Error",
                            message: "JWT Token error:" + jwtSignErr,
                            success: false
                        };
                    }
                    else {
                        if (user) {
                            // tslint:disable-next-line:no-console
                            console.log("User exists!!!!");

                            return res.status(200).json({
                                result: {
                                    favorites: user.favorites,
                                    message: "User signed in",
                                    shoppingBasket: user.shoppingBasket,
                                    token: token,
                                    userVerified: true,
                                    username: user.social_login.oauthID
                                }
                            });
                        }
                        else {
                            
                            var newUser = new User();
                            // console.log("Profile is:", profile);
                            // Initiate the user details
                            newUser.social_login.oauthID = profile.id;
                            newUser.social_login.name = profile.name;
                            newUser.social_login.created = Date.now();

                            // Set favorites and the shopping basket as empty
                            newUser.favorites = [];
                            newUser.shoppingBasket = [];
                            // tslint:disable-next-line:no-console
                            console.log("New user created!!!!");
                            newUser.save(function (registrationErr) {
                                if (registrationErr) {
                                    // Share registration error issue that occurs due to MongoDB
                                    // tslint:disable-next-line:no-console
                                    console.log("Registration error: ", registrationErr);
                                    return res.status(400).json({
                                        result: {
                                            message: result.message,
                                            status: "error"
                                        }
                                    });
                                }
                                else {
                                    // tslint:disable-next-line:no-console
                                    console.log("Saving the new user", newUser);

                                    // Share user saved status
                                    return res.status(200).json({
                                        result: {
                                            favorites: user.favorites,
                                            message: "User signed in",
                                            shoppingBasket: user.shoppingBasket,
                                            token: token,
                                            userVerified: true,
                                            username: user.social_login.oauthID
                                        }
                                    });
                                }
                            });
                        }
                    }
                });

               
            });
        });
    };

};

module.exports = handleSocialSignIn;