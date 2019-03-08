# Web App Available functionalities:

## General Functionalities:
- NodeJS backend
- MongoDB as database
- React as frontend
	- Redux to support the app state
- User registration with smtp with gmail
- Local sign-in functionality with PassportJS JWT strategy
	- Expirable Local Storage to control user login and logouts
- Typescript to provide static typing for better control of data and its types
- Bootstrap4 and page breaks used for responsive design

# Views
## Standard home page direction for guests
- Container routes to the 'App'presentational view and shows the home page for guests with Login functionality
- Page has currently automatic login functionalities for the users who has non-expired verified localstorage token
	- In case user is already logged in, login functionality disables and a logout functionality appears
- This page also enables users to do basic searches of Books, Toys and other categories and relevant subcategories. 
Accordingly, it shows the relevant items and controls the store state
- Page has currently automatic login functionalities for the users who has non-expired verified localstorage token
	- In case user is already logged in, login functionality disables and a logout functionality appears
- Enables adding to favorites or shopping basket (To be done)

![alt text](https://github.com/mesarikaya/WebShopWithReact/blob/master/snapshots/Capture1.PNG)

![alt text](https://github.com/mesarikaya/WebShopWithReact/blob/master/snapshots/Capture2.PNG)

## Product page
- Provides details of the clicked product. 
	- Its image
	- Author or producer
	- Description
	- Enables adding to favorites or shopping basket (To be done)

![alt text](https://github.com/mesarikaya/WebShopWithReact/blob/master/snapshots/Capture7.PNG)

## Account Page
- This route enables sign in or sigup functionality
- Sign in is managed by PassportJS JWT strategy which enables Local storage token validation and expiry
- Additional Social login plugins will be enables later on
- Sign up click diverts to the Sign up form page

![alt text](https://github.com/mesarikaya/WebShopWithReact/blob/master/snapshots/Capture3.PNG)

## Sign up Page
- Provides the sign up form and enables local user registration via using smtp with gmail
- Upon registration sign up is done via using smtp with gmail and it sends a verification email to the user with a token.
Upon verification link click in the sent email, user is directed to 'verify' route. If the token is verified, then user is directed
to the main page and the current state of the store is presented. If not, it stays in the 'account' page.
![alt text](https://github.com/mesarikaya/WebShopWithReact/blob/master/snapshots/Capture4.PNG)
![alt text](https://github.com/mesarikaya/WebShopWithReact/blob/master/snapshots/Capture5.PNG)
![alt text](https://github.com/mesarikaya/WebShopWithReact/blob/master/snapshots/Capture6.PNG)

# ToDo List
- Add social login strategies
- Create Favorites and shopping Basket modal views as a presentational component
- Enable on click favorites and basket update
- For guest users disable the favorites and baskets
- Create a sample payment page for checkout (Not a real one)
- Couple the already created validation messages to the views inside error prop
- Deploy to Heroku
