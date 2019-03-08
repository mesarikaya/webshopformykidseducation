'use strict';
var users = require('../models/user.js');
var contents = require('../models/content.js');

// Service that handles the the user info related tasks on the webpage

// Just as a starting point a function is introduced for future use if needed
function handleUserInfo() {
    // For now no specific functionalities to

    // Modify the user favorites if available
    this.modifyFavorites = function (req, res) {
        // Set the parameters
        let author = req.query.Author;
        let description = req.query.Description;
        let group = req.query.Group;
        let image = req.query.Image;
        let imageId = req.query.ImageId;
        let name = req.query.Name;
        let reserved = req.query.Reserved;
        let reservedUntil = req.query.ReservedUntil;
        let type = req.query.Type;
        let action = req.query.action;
        let userId = req.query.UserId;

        // tslint:disable-next-line:no-console
        console.log("In the add to favorites controller function: ", req.query, "Action is:", action);

        if (userId !== "guest") {

            // Search if user has the producID already in favorites
            let userQuery = users.findOne({ $or: [{ 'local_login.email': userId, 'favorites.ImageId': imageId }, { 'social_login.oauthID': userId, 'favorites.ImageId': imageId }] });

            return new Promise((resolve, reject) => {

                // if the user has it then do nothing otherwise add
                userQuery.exec(function (err, userDoc) {
                    if (err) {
                        // Reject the promise and catch Error
                        reject(err);
                    }

                    if (userDoc) {
                        if (action === "delete") {
                            resolve([userId, "delete"]);
                        } else {
                            reject(new Error("Record already exists"));
                        }
                    } else {
                        if (action === "delete") {
                            reject(new Error("No such favorite document exists"));
                        } else {
                            resolve([userId, "add"]);
                        }
                    }
                });
            }).then(request => {
                const userID = request[0];
                const actionType = request[1];
                let user = users.findOne({ $or: [{ 'local_login.email': userID }, { 'social_login.oauthID': userId }] });

                // Search if the user has the specific product in the favorites
                user.exec(function (userErr, doc) {
                    if (userErr) {
                        // Reject the promise and catch Error
                        reject(userErr);
                    }

                    // If user exists
                    if (doc) {
                        // Check if this is a Delete or Add Action
                        if (actionType === "add") {
                            // Add the item to the favorites list
                            doc.favorites.push({
                                Author: author,
                                Description: description,
                                Group: group,
                                Image: image,
                                ImageId: imageId,
                                Name: name,
                                Reserved: reserved,
                                Reserved_Until: reservedUntil,
                                Type: type
                            });
                        } else { // Then delete action is requested
                            // Delete the clicked item from the favorites list
                            doc.favorites = doc.favorites.filter(function (item) {
                                return item.ImageId.toString() !== imageId.toString();
                            });
                        }
                        // Save the new state of the user favorites document
                        doc.markModified('favorites');
                        doc.save(function (err, result) {
                            if (err) { throw err; }
                        });
                        // Send success response so that redux dispatches favorites state update
                        return res.status(200).json({ "result": doc.favorites });
                    } else {
                        // Reject the promise and catch Error
                        reject(new Error("Record does not exist"));
                    }
                });

            }).catch(error => {
                return res.status(404).json({ "result": error });
            });
        } else {
            return res.status(405).json({ "result": "With guest user it is not allowed to dothis action: " + error });
        }
      
    };

    // modify ShoppingBasket to the user if available
    this.modifyBasket = function (req, res) {
        // Set the parameters
        let author = req.query.Author;
        let description = req.query.Description;
        let group = req.query.Group;
        let image = req.query.Image;
        let imageId = req.query.ImageId;
        let name = req.query.Name;
        let reserved = req.query.Reserved;
        let reservedUntil = req.query.ReservedUntil;
        let type = req.query.Type;
        let action = req.query.action;
        let userId = req.query.UserId;

        // tslint:disable-next-line:no-console
        console.log("In the add to shopping basket controller function: ", req.query, "Action is:", action);

        if (userId !== "guest") {

            // Search if user has the producID already in favorites
            let userQuery = users.findOne({ $or: [{ 'local_login.email': userId, 'shoppingBasket.ImageId': imageId }, { 'social_login.oauthID': userId, 'shoppingBasket.ImageId': imageId }]});

            return new Promise((resolve, reject) => {

                // if the user has it then do nothing otherwise add
                userQuery.exec(function (err, userDoc) {
                    if (err) {
                        // Reject the promise and catch Error
                        reject(err);
                    }

                    if (userDoc) {
                        if (action === "delete") {
                            resolve([userId, "delete"]);
                        } else {
                            reject(new Error("Record already exists"));
                        }
                    } else {
                        if (action === "delete") {
                            reject(new Error("No such shopping basket document exists"));
                        } else {
                            resolve([userId, "add"]);
                        }
                    }
                });
            }).then(request => {
                const userID = request[0];
                const actionType = request[1];
                let user = users.findOne({ $or: [{ 'local_login.email': userID }, { 'social_login.oauthID': userId}]});

                // Search if the user has the specific product in the favorites
                user.exec(function (userErr, doc) {
                    if (userErr) {
                        // Reject the promise and catch Error
                        reject(userErr);
                    }

                    // If user exists
                    if (doc) {
                        // Check if this is a Delete or Add Action
                        if (actionType === "add") {
                            // Add the item to the favorites list
                            doc.shoppingBasket.push({
                                Author: author,
                                Description: description,
                                Group: group,
                                Image: image,
                                ImageId: imageId,
                                Name: name,
                                Reserved: reserved,
                                Reserved_Until: reservedUntil,
                                Type: type
                            });
                        } else { // Then delete action is requested
                            // Delete the clicked item from the shopping basket list
                            doc.shoppingBasket = doc.shoppingBasket.filter(function (item) {
                                return item.ImageId.toString() !== imageId.toString();
                            });
                        }
                        // Save the new state of the user favorites document
                        doc.markModified('shoppingBasket');
                        doc.save(function (err, result) {
                            if (err) { throw err; }
                        });
                        // Send success response so that redux dispatches shopping basket state update
                        return res.status(200).json({ "result": doc.shoppingBasket });
                    } else {
                        // Reject the promise and catch Error
                        reject("No such User exists");
                    }
                });

            }).catch(error => {
                return res.status(404).json({ "result": error });
            });
        } else {
            return res.status(405).json({ "result": "With guest user it is not allowed to do this action: " + error });
        }

    };
}

module.exports = handleUserInfo;