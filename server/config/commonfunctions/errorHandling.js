
// Functions to handle the error communications
function handleErrors() {

    // Function to send a subscription email via NodeMailer
    this.sendErrorDetails = (err, res) => {
        // tslint:disable-next-line:no-console
        console.log("In error: ", err);
        if (err) {
            if (err.code === 500) {
                // the 500 server access issue
                return {
                    error: 'No such route is available.',
                    message: 'No such route exists.',
                    success: false
                };
            }

            if (err.name === 'MongoError' && err.code === 11000) {
                // the 11000 Mongo code is for a duplication email error
                // the 409 HTTP status code is for conflict error
                return {
                    errors:'This email is already taken.',
                    message: 'This email is already taken! Please check the entered credentials!',
                    success: false
                };
            }

            if (err.code === 535) {
                return {
                    errors: 'Subscription failed due to Invalid credentials.',
                    message: 'Check the provided credentials',
                    success: false
                };
            }

            return {
                errors: 'Problem with form evaluation',
                message: 'Could not process the form.' + err.message,
                success: false
            };
        }

        return {
            errors: '',
            message: 'You have successfully signed up! Now you should be able to log in.',
            success: true
        };
    }
}
module.exports = handleErrors;