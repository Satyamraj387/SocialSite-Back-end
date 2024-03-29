const express= require('express');
const env = require('./config/environment');
const logger = require('morgan');
const cookieParser= require('cookie-parser');
const app= express();
require('./config/view_helpers')(app);
const port= 8000;
const expressLayouts= require('express-ejs-layouts');
const db= require('./config/mongoose');
//used for session cookie
const session= require('express-session');
const passport= require('passport');
const passportLocal= require('./config/passport-local-strategy');
const passportJWT = require ('./config/passport-jwt-strategy');
const passportgoogle = require('./config/passport-google-oauth2-strategy');

const MongoStore =require('connect-mongo');
// const sassMiddlewaare = require ('node-sass-middleware');
const flash = require('connect-flash');
const customMware = require('./config/middleware');

//setup chat server to be used with socket.io
const chatServer= require('http').Server(app);
const chatSockets = require('./config/chat_sockets').chatSockets(chatServer);
chatServer.listen(5000);
console.log('chat server is on port 5000');
const path = require('path');

// if(env.name==development){
// app.use(sassMiddlewaare({
//     src: path.join(__dirname, env.asset_path, 'scss'), 
//     dest: path.join(__dirname,,env.asset_path, 'css'),
//     debug: true,
//     outputStyle: 'extended',
//     prefix: '/css'

// }}));

app.use(express.urlencoded({extended:false}));

app.use(cookieParser());

 app.use(express.static(env.asset_path));
//make the uploads path available  to the browser
 app.use('/uploads', express.static(__dirname + '/uploads'));

 app.use(logger(env.morgan.mode, env.morgan.options));

app.use(expressLayouts);

//extract styles and script fom individual pages and put it on top and bottom of layouts
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// //use express router
// app.use('/',   require('./routes/index.js'));

//set up view engine
app.set('view engine', 'ejs');
app.set('views', './views');

//mongo store is used to store the session cookie in the db
app.use(session({
    name: 'socialSite',
    //change the secret before deployment 
    secret: env.session_cookie_key,
    saveUninitialized: false,
    resave: false,
    cookie:{
        maxAge: (1000*60*100)
    },
    store: MongoStore.create(
        {
          mongoUrl: 'mongodb://localhost/codeial_development',
          autoRemove: "disabled",
        },
    function(err){
        console.log(err || 'connect-mongodb setup ok');
    })
}) );
app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);


app.use(flash());
app.use(customMware.setFlash);
 
//use express router
app.use('/',   require('./routes/index.js'));
app.listen(port, (err)=>{
    if(err){
        console.log(`error in running the server: ${err} `);
    }
    console.log(`sever is running on port: ${port}`);
});