// server/routes/index.js
// tslint:disable-next-line:no-console

const contents = require(process.cwd() + '/server/routes/content.js');
const users = require(process.cwd() + '/server/routes/user.js');

// Set the available routers for the routing action
// Modularize based on user related routing, signin, verification, etc
// and page content related routing
module.exports = (router, passport) => {
    contents(router);
    users(router, passport);
};
