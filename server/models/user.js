'use strict';
var mongoose = require('mongoose');

//Connect to the database
var Schema = mongoose.Schema;

// Create Favorites schema
var favoritesSchema = new Schema({
    Author: String,
    Description: String,
    Group: String,
    Image: String,
    ImageId: String,
    Name: String,
    Reserved: String,
    Reserved_Until: String,
    Type: String
});

// Create shopping basket schema
var shoppingBasketSchema = new Schema({
    Author: String,
    Description: String,
    Group: String,
    Image: String,
    ImageId: String,
    Name: String,
    Reserved: String,
    Reserved_Until: String,
    Type: String
});

// Set user document schema
var UserSchema = new Schema({
    favorites: [favoritesSchema],
    local_login: {
        city: String,
        country: String,
        email: {
            trim: true,
            type: String,
        },
        firstName: String,
        houseNumber: String,
        isVerified: { type: Boolean, default: false },
        mobileNumber: String,
        password: {
            trim: true,
            type: String
        },
        password_reset_expires: Date,
        password_reset_token: String,
        permalink: String,
        security_answer: String,
        streetName: String,
        surname: String,
        verify_token: String,
        verify_token_expires: Date,
        zipcode: String
    },
    shoppingBasket: [shoppingBasketSchema],
    social_login: {
        created: Date,
        name: String,
        oauthID: {}
    }
}, { collection: 'User' });

// Set the data model name specifically and export
module.exports = mongoose.model('user', UserSchema, "Users");