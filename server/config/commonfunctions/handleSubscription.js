
var nodemailer = require('nodemailer');
var bcrypt = require('bcryptjs');
var User = require('../../models/user.js');

// Functions to handle the verification email
function handleSubscription() {

    // Function to send a subscription email via NodeMailer
    this.sendEmail = (req, email, verificationToken) => {
        // Use nodemailer.js
        // tslint:disable-next-line:no-console
        console.log("inside handle email sending");

        // tslint:disable-next-line:no-console
        console.log("Email", email + "", "Password:", process.env.password + "");
        var transporter = nodemailer.createTransport({
            auth: {
                pass: process.env.password + "",
                user: 'kidbooksnoreply@gmail.com',
            },
            host: 'smtp.gmail.com',
            port: 465,
            secure: true
        });

        // Set the mail options                   
        var mailOptions = {
            from: 'kidbooksnoreply@gmail.com',
            subject: 'Account Verification Token',
            text: 'Dear user of ' + email + ',\n\n' + 'We are delighted to see you joining our growing customer base.\n\n' +
                    'To be able to finalize the sign up process, please verify your account by clicking the link: \n\n' +
                    req.headers.origin + '\/' + 'verify' +
                    '\/' + email + '\/' + verificationToken + '.\n\n' +
                    'Thanks for choosing us.\n\n' +
                    'Kind Regards, \n\n' + 'On behalf of KidsBooksWebShop Team',
            to: email + "",
        };

        // Send the email                   
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                // tslint:disable-next-line:no-console
                console.error("Email could not be sent due to error:", error);
                const customErr = {
                    "code": 535,
                    "message": "Email could not be sent due to error:" + error,
                    "name": "Invalid subscription credentials",
                };
                return done(customErr, false);   
            } else {
                // tslint:disable-next-line:no-console
                console.log('Email sent: ' + info.response);
            }
        });
    }

    this.encryptUserInfo = (req, done, email, password, verificationToken, saltRounds, newUser) => {

        bcrypt.hash(password, saltRounds, function (encryptionErr, hash) {
            if (encryptionErr) {
                // tslint:disable-next-line:no-console
                console.log("Hashing error: ", encryptionErr)
                const customErr = {
                    "code": 400,
                    "message": "Hashing error:" + error,
                    "name": "Invalid subscription credentials",
                };
                return done(customErr, false); 
            }

            // Create a link and generate a verification token 
            var permalink = req.body.email.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();

            // set the timestamp for verification token expiry: 10 minutges
            var expiryDuration = 1 / 6 * 60 * 60 * 1000; // in miliseconds
            var d = new Date();
            var expiryTimestamp = d.getTime() + expiryDuration;

            // Record unique user details
            newUser.local_login.email = email;
            newUser.local_login.password = hash;

            // Store the permalink
            newUser.local_login.permalink = permalink;

            // Set verified status to False and set the verification token. 
            // isVerified will turn to true upon confirmation
            newUser.local_login.isVerified = false;
            newUser.local_login.verify_token = verificationToken;
            newUser.local_login.verify_token_expires = expiryTimestamp;

            // Assign form entries of the user
            newUser.local_login.city = req.body.city;
            newUser.local_login.country = req.body.country;
            newUser.local_login.email = req.body.email;
            newUser.local_login.firstName = req.body.firstName;
            newUser.local_login.houseNumber = req.body.houseNumber;
            newUser.local_login.mobileNumber = req.body.mobileNumber;
            newUser.local_login.security_answer = req.body.security_answer;
            newUser.local_login.streetName = req.body.streetName;
            newUser.local_login.surname = req.body.surname;
            newUser.local_login.zipCode = req.body.zipCode;

            // Set favorites and the shopping basket as empty
            newUser.favorites = [];
            newUser.shoppingBasket = [];

            // Try to save the user. If successful, send the verification email
            try {

                newUser.save(function (registrationErr) {
                    if (registrationErr) {
                        // Share registration error issue that occurs due to MongoDB
                        // tslint:disable-next-line:no-console
                        console.log("Registration error: ", registrationErr);
                        const customErr = {
                            "code": 400,
                            "message": "Email could not be sent due to error:" + registrationErr,
                            "name": "Registration Error"
                        };
                        return done(customErr, false); 
                    }
                    else {
                        // tslint:disable-next-line:no-console
                        console.log("Saving the new user", newUser);
                        // Share user saved status
                        const successMsg = {
                            "code": 200,
                            "message": "User is successfully registered!",
                            "name": "Registration success"
                        };
                        return done(null, true); 
                    }
                });
            }
            catch (err) {
                // tslint:disable-next-line:no-console
                const customErr = {
                    "code": 400,
                    "message": "Email could not be sent due to error:" + registrationErr,
                    "name": "Registration Error"
                };
                return done(customErr, false); 
            }
        });
    }

    this.verifyEmail = function (req, res) {
        var email = req.query.email;
        var token = req.query.token;

        User.findOne({ 'local_login.email': email } , function (err, user) {

            if (err) {
                const customErr = {
                    "message": "Database Error in user email verification",
                    "name": "Verification Error",
                    "status": false
                };
                return res.json(customErr);
            }

            // Get the expiry time of the token
            var d = new Date();
            var currentTime = d.getTime();
            var expiryTimestamp = new Date(user.local_login.verify_token_expires).getTime();

            if (user.local_login.verify_token === token && expiryTimestamp >= currentTime) {
                User.findOneAndUpdate({ 'local_login.email': email }, { 'local_login.isVerified': true }, function (mongoErr, resp) {
                    if (mongoErr) {
                        const customErr = {
                            "message": "Database Error in user email verification",
                            "name": "Verification Error",
                            "status": false
                        };
                        return res.json(customErr);
                    }
                    else {
                        const successMsg = {
                            "message": "Welcome, redirecting to home page!",
                            "name": "Verification Successful",
                            "status": true
                        };                        
                        return res.json(successMsg);
                    }
                });
            }
            else {
                const customErr = {
                    "message": "Outdated Token",
                    "name": "Verification Error",
                    "status": false,
                };
                return res.json(customErr);
            }
        });
    };
}

module.exports = handleSubscription;


