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
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: TWO_HOURS,
        sameSite: true


    }
}))

app.set('view engine' , 'ejs')


app.get('/', people)
app.get('/filter', filters)
app.get('/static', (req, res) => res.sendfile(path.join(__dirname + '/static/index.html')))
app.get('/about',(req, res) => res.send('De about pagina bitches'))
app.get('/contact',(req, res) => res.send('De contact pagina'))

app.post('/', add)


function filters(req,res){
    res.render('filter.ejs')
}

function add(req,res){
    
    let sexualityFilter = req.body.sexuality
    let genderFilter = req.body.gender
    console.log(genderFilter)

    db.collection('datingapp').find({gender: genderFilter, sexuality: sexualityFilter}).toArray(done)
        function done(err, data){
            if (err){
                next(err)
            } else {
                console.log(data);
                res.render('index.ejs', {data: data})
            }
        }
     
}


// const genderChecked = document.querySelector('input[name=gender]:checked')
// const sexualityChecked = document.querySelector('input[name=sexuality]:checked')




function people(req, res, next){
    db.collection('datingapp').find({}).toArray(done)
        function done(err, data){
            if (err){
                next(err)
            } else {
                console.log(data);
                res.render('index.ejs', {data: data})
            }
        }
}



// function remove




app.listen(port,() => console.log('Example app listening on port' + port))