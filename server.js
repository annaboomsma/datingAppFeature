// ---- THIS IS WHERE I REQUIRE NPM PACKAGES
const express = require('express')
const bodyParser = require('body-parser')
const mongo = require('mongodb')
const session = require('express-session')
// Becouse i use a .env file to store private information i need to request that to
require('dotenv').config()

// ---- THESE ARE MY VARIABLES I USE
const app = express()
const port = 3000
const TWO_HOURS = 1000 * 60 * 60 * 2



// ---- THIS IS THE CODE FOR THE CONNECTION WITH THE DATABASE
let db = null
let url = 'mongodb+srv://asd123:asd123@datingapp-ishqp.mongodb.net/test?retryWrites=true&w=majority'
// ik heb mijn url er in gezet want als ik het in mijn .env bestand zet je de database niet kunt gebruiken


mongo.MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client){
    if (err) {
        throw err
    }
    db = client.db(process.env.DB_NAME)
})
// ---- THIS IS WHERE THE CODE FOR THE DATABASE ENDS

// ---- THIS IS WHERE I MAKE THE ROUTES
app.use('/static',express.static('static'))
app.use(bodyParser.urlencoded({extended: true}))
// This is where i make the session
app.use(session({
    name: process.env.SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESS_SECRET,
    cookie: {
        maxAge: TWO_HOURS,
        sameSite: true


    }
}))
// This is how i tell the server i use ejs as the view engine
app.set('view engine' , 'ejs')
// This is where i make the normal routes
app.get('/', home)
app.get('/results', filter)
app.get('/filter', filters)
app.get('/login', login)
app.get('/profile', profile)
// This is where i make the post routes for the forms
app.post('/results', people)
app.post('/login', loginpost)
app.post('/logout', logoutpost)
app.post('/profile', profilepost)

// ---- THIS IS WHERE ALL THE FUNCTIONS ARE
// This is where i check if there is a session and i manage the path the user will take
function home(req,res){
    console.log(req.session)
    let { userId } = req.session
    if(!userId){
        // If there isn't a userId aka a session render home.ejs
        res.render('home.ejs')
    } else{
        // If there is a userId aka a session redirect to the results
        res.redirect('/results')
        console.log(req.session)
    }
    
}
// In this function where we look for the people that fit the filter from the user
function filter(req, res, next){
    db.collection('datingapp').find({
        // This is where we find the userId and the gender & sexuality they want to filter on and we filter the rest of the people with the .find
        $and: [  
        {firstName:{$ne: req.session.userId.firstName}},
        {gender: req.session.userId.filter['gender']}, 
        {sexuality: req.session.userId.filter['sexuality']}
    ]}).toArray(done)
        function done(err, data){
            if (err){
                next(err)
            } else {
                // 
                res.render('index.ejs', {data: data})
            }
        }
}
// In this function we make sure the filters the userId want's to filter on are send to the database
function people(req, res){
    // This is where we implement the preferences in the database
    db.collection('datingapp').updateOne(
        {firstName: req.session.userId.firstName}, 
        {$set: {filter: req.body}})
    // This is where we find the userId aka the session so we update the preferences for the right user     
    db.collection('datingapp').findOne({firstName: req.session.userId.firstName}, done)
    function done(err, data){
        if (err){
            next(err)
        }else {
            // This is where we redirect the user to the list of people with the filters on
            req.session.userId = data
            res.redirect('/results')
        }} 
            
}
// The next three functions render ejs pages. 
function filters(req, res){
    res.render('filter.ejs')
}

function login(req, res){
    res.render('login.ejs')
}

function profile(req, res){
    // In this function we use the data from the current userId aka the session 
   res.render('profile.ejs', {data:req.session.userId}) 
}
// In this filter we check if the person who want to login is in our database and if the email and password are correct
function loginpost(req,res){
    // This is where we make variables for the input the user gives us
    const email = req.body.email
    const password = req.body.password
    // This is where we find the user and see if the email and password exist in our database
    if (email && password){
        db.collection('datingapp').findOne({email: email, password: password}, done)
        function done(err, data){
            if (err){
                next(err)
            }else {
                req.session.userId = data
                res.redirect('/results')
        }}  
    }  
}
// In this filter we make sure the user can logout
function logoutpost(req,res){
    // This is where we destroy the session
    req.session.destroy(err => {
        if(err){
            return res.redirect('/results')
        } else {
            // This is where we clear the cookie and we redirect the user to the homepage
            res.clearCookie(process.env.SESS_NAME)
            res.redirect('/')
        }
    })
}
// In this function we make sure the user can update it's haircolor and this wil be changed in the database
function profilepost(req,res){
 db.collection('datingapp').updateOne(
        // First we find the userId aka the session and then we update the haircolor with the input from the user
        {firstName: req.session.userId.firstName}, 
        {$set: {hair: req.body.hair}})
        
        db.collection('datingapp').findOne({firstName: req.session.userId.firstName}, done)
        function done(err, data){
            if (err){
                next(err)
            }else {
                req.session.userId = data
                res.redirect('/results')
            }}         
}

// ---- THIS IS HOW I CHECK IF THE SERVER IS RUNNING
app.listen(port,() => console.log('Example app listening on port' + port))