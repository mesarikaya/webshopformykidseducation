'use strict';
var contents = require('../models/content.js');

// Service that handles the page content related functionalities

// This function sets the images that needs to be shown in the web page
function handlePageContent() {

    // High Level product Search based on CAtegory, Type and Group
    this.getImages = function (req, res, type) {
        // tslint:disable-next-line:no-console
        console.log("In the get images function: ", type);

        // Retrieve the related age group
        let ageGroup = req.query.ageGroup;

        let query = contents.find({}); // Set default search to all images
        if (type === null ) {
            // tslint:disable-next-line:no-console
            console.log("In the null: ", type);
            query = contents.find({});
        } else if (type === "Smart Toys") {
            // tslint:disable-next-line:no-console
            console.log("All contents are pulled with type: ", type);
            query = contents.find({ 'Type': type });
        } else {
            // tslint:disable-next-line:no-console
            console.log("All contents are pulled with type: ", type);
            if (ageGroup === "All") {
                query = contents.find({ 'Type': type });
            } else {
                query = contents.find({ 'Type': type, 'Group': ageGroup });
            }
        }

        query.exec(function (err, doc) {
            if (err) {
                // tslint:disable-next-line:no-console
                console.log("inside the mongo call ");
                // Send error message due to connection issue
                return res.status(503).json({
                    result: {
                        message: err + "server connection issue",
                        status: "error"
                    }
                });
            }

            if (contents) {
                return res.status(200).json({ "result": doc});
            }else {
                // No content is found
                return res.status(400).json({
                    result: {
                        message: "No content is available",
                        status: "error"
                    }
                });
            }
        });
    };

    // Generic Product search based on search text
    this.searchProduct = function (req, res) {
        // tslint:disable-next-line:no-console
        console.log("Search text is: ", req.query.searchText);

        // Retrieve the related age group
        let searchText = req.query.searchText;

        // Set default search to all images
        let query = contents.find({
            $or: [
                { 'Type': { $regex: '.*' + searchText + '.*', $options: 'i'} },
                { 'Name': { $regex: '.*' + searchText + '.*', $options: 'i'} },
                { 'Description': { $regex: '.*' + searchText + '.*', $options:'i' } 
                }
            ]
        }); 
        
        query.exec(function (err, doc) {
            if (err) {
                // Send error message due to connection issue
                return res.status(503).json({
                    result: {
                        message: err + "server connection issue",
                        status: "error"
                    }
                });
            }

            if (contents) {
                return res.status(200).json({ "result": doc });
            } else {
                // No content is found
                return res.status(400).json({
                    result: {
                        message: "No content is available",
                        status: "error"
                    }
                });
            }
        });
    };


    // Generic Specific product by Id
    this.getProduct = function (req, res) {
        // Retrieve the related age group
        let productId = req.query.id;

        // Set default search to all images
        let query = contents.find({ '_id': productId } );

        query.exec(function (err, doc) {
            if (err) {
                // Send error message due to connection issue
                return res.status(503).json({
                    result: {
                        message: err + "server connection issue",
                        status: "error"
                    }
                });
            }

            if (contents) {
                return res.status(200).json({ "result": doc });
            } else {
                // No content is found
                return res.status(400).json({
                    result: {
                        message: "No content is available",
                        status: "error"
                    }
                });
            }
        });
    };
}

module.exports = handlePageContent;