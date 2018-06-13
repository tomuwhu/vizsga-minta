const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mdb = require('mongodb')
const MongoClient = mdb.MongoClient
app.use( express.static('dist') )
app.use( bodyParser.json() )
var db
MongoClient
    .connect(
        'mongodb://localhost:27017/animals',
        (err, client) => {
            if (err) console.log('MongoDB Kapcsolódás sikertelen!')
            else {
              db = client.db('animals')
              console.log('MongoDB szerver rendben.')
            }
        }
    )

//use this only in development mode!
app.use( (req, res, next) => {
    res.header(
        'Access-Control-Allow-Origin',
        '*'
    )
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
} )
//do not use it in production mode!

app.post(
  '/',
  (req,res) => {
    if (db) {
      db.collection('pets')
        .insertOne(req.body)
        .then( () => res.send(req.body) )
    }
    else {
      res.send({error: 1})
    }
  }
)
app.post(
  '/modify',
  (req,res) => {
    if (db) {
      db.collection('pets')
        .updateOne(
          { _id : mdb.ObjectId(req.body._id) },
          { $set: {
            "allatnev" : req.body.allatnev,
            "tulajnev" : req.body.tulajnev,
            "tultel"   : req.body.tultel,
            "fajta"    : req.body.fajta,
            "szule"    : req.body.szule,
            "veszolip" : req.body.veszolip,
          } }
        )
        .then( (resp) => {
            res.send(resp.result)
        } )
    }
    else {
      res.send({error: 1})
    }
  }
)
app.post(
  '/del',
  (req,res) => {
    if (db) {
      db.collection('pets')
        .deleteOne( { _id : mdb.ObjectId(req.body.id) } )
        .then( (resp) => res.send(resp) )
    }
    else {
      res.send({error: 1})
    }
  }
)

app.get(
  '/',
  (req, res) => {
      if (db)
      db.collection('pets')
        .find()
        .toArray(
          (err, result) => {
              if (err) {
                res.send(err)
              } else {
                res.send(result)
              }
          }
        )
      else {
        res.send({error: 1})
      }
  }
)

app.listen(
    3000,
    () => console.log(
          'Back-end szerver elérhető a http://localhost:3000 webcímen'
    )
)
