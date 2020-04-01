const express = require('express')
const slug = require('slug')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const path = require('path')
const mongo = require('mongodb')
const session = require('express-session')

const TWO_HOURS = 1000 * 60 * 60 * 2

require('dotenv').config()

// THIS IS THE CODE FOR THE CONNECTION WITH THE DATABASE
let db = null
let url = 'mongodb+srv://asd123:asd123@datingapp-ishqp.mongodb.net/test?retryWrites=true&w=majority'
// ik heb mijn url er in gezet want als ik het in mijn .env bestand zet je de database niet kunt gebruiken


mongo.MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client){
    if (err) {
        throw err
    }
    db = client.db(process.env.DB_NAME)
})

// THIS IS WHERE THE CODE FOR THE DATABASE ENDS

app.use('/static',express.static('static'))
app.use(bodyParser.urlencoded({extended: true}))
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

app.set('view engine' , 'ejs')

app.get('/', home)
app.get('/results', people)
app.get('/filter', filters)
app.get('/login', login)


app.post('/results', filter)
app.post('/login', loginpost)

function home(req,res){
    console.log(req.session)
    let { userId } = req.session
    if(!userId){
        res.render('home.ejs')
    } else{
        res.redirect('/results')
        console.log(req.session)
    }
    
}

function filters(req,res){
    res.render('filter.ejs')
}

function login(req,res){
    res.render('login.ejs')
}

function loginpost(req,res){
    const email = req.body.email
    const password = req.body.password
    console.log(email + password)
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


function people(req, res, next){
    db.collection('datingapp').find({
        $and: [  
        {firstName:{$ne: req.session.userId.firstName}},
        {gender: req.session.userId.filter['gender']}, 
        {sexuality: req.session.userId.filter['sexuality']}
    ]}).toArray(done)
        function done(err, data){
            if (err){
                next(err)
            } else {

                res.render('index.ejs', {data: data})
            }
        }
}


function filter(req, res){
    db.collection('datingapp').updateOne(
        {firstName: req.session.userId.firstName}, 
        {$set: {filter: req.body}})
        
        
        db.collection('datingapp').findOne({firstName: req.session.userId.firstName}, done)
        function done(err, data){
            if (err){
                next(err)
            }else {
                req.session.userId = data
                res.redirect('/results')
            }}         
}


app.listen(port,() => console.log('Example app listening on port' + port))