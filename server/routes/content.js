
var ImageController = require(process.cwd() + '/server/controllers/content_controller.js');

/**
 * Page content routes via using the expressJS set route object
 * @param {any} router
 */
module.exports = (router) => {

    // GET method to retrieve the images to be shown on the page
    var imageController = new ImageController();
    router
        .route('/images')
            .get(function (req, res) {
                // tslint:disable-next-line:no-console
                console.log("Called the GET with type:", req.query.searchType);
                let searchType = req.query.searchType;

                // Check if search types are in expected types
                // And just present all the content if not
                let expectedTypes = ['allItems', 'Books', 'Puzzles', 'Toys', 'Smart Toys'];

                if (expectedTypes.includes(searchType)) {
                    if (searchType === "allItems") {
                        // tslint:disable-next-line:no-console
                        console.log("Calling AllItems");
                        imageController.getImages(req, res, null);
                    } else {
                        // tslint:disable-next-line:no-console
                        console.log("Calling the REST");
                        imageController.getImages(req, res, searchType);
                    }
                } else { // The requested content is not found, just share the full content
                    // tslint:disable-next-line:no-console
                    console.log("Calling AllItems");
                    imageController.getImages(req, res, null);
                }   
        });

    router
        .route('/searchProduct')
        .get(function (req, res) {
                // Search product
                imageController.searchProduct(req, res);
        });

    // Get product by ID
    router
        .route('/product')
        .get(function (req, res) {
            // Get specific product based on id
            imageController.getProduct(req, res);
        }); 
};