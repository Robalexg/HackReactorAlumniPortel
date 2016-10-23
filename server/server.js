var express = require("express")
var path = require("path")
var app = express()
var configKnex = require("../knexfile.js")
var middleware = require("./config/middleware")
var authFacebook = require('./config/passport.js')
var passport = require("passport")
var uuid = require("uuid")
var cookieParser = require('cookie-parser')

var knex = require('knex')(configKnex.development)
knex.migrate.latest([configKnex])

authFacebook(passport,knex,app)
middleware(app,express)

app.use(cookieParser())

app.get("/auth",function (req,res) {
  if(req.cookies['session-id']){
    knex("sessions").where({sessionId:req.cookies['session-id']}).then(function(session){
      if(session != 0){
        res.sendStatus(200)      
      }else{
        res.sendStatus(401)
      }
    })
  }
})

app.get('/messages',function(req,res){
	knex.select('*').from('messages').orderBy('created_at', 'desc')
  .then(function (table) {
		res.status(200).json(table)
	})
  .catch(function(err){
    console.log('this is a get/messages error', err)
  })
})


app.post('/messages',function(req,res){
  console.log('############', req.body)
  knex('messages').insert({content: req.body.content, firstName: req.body.firstName, lastName: req.body.lastName, photolink: req.body.photolink, msgImageUrl: req.body.msgImageUrl})
  .then(function () {
    console.log('this was added')
    res.status(201).end()
  })
})

app.get('/comments',function(req,res){
  knex.select('*').from('comments').orderBy('created_at', 'desc')
  .then(function (table) {
    res.status(200).json(table)
  })
  .catch(function(err){
    console.log('this is a get/comments error', err)
  })
})

app.post('/comments',function(req,res){
  console.log('############ comments post', req.body)
  knex('comments').insert({content: req.body.content, firstName: req.body.firstName, lastName: req.body.lastName, photolink:req.body.photolink, msgId: req.body.msgId})
  .then(function () {
    console.log('this comment was added')
    res.status(201).end()
  })
})

// Updating Likes in the  Database. 
app.post('/likes',function(req,res){
  console.log('############ in likessss', req.body)
  knex('messages')
  .where({ id: req.body.content})
  .update({ likes: req.body.like})
  .then(function(data){
    console.log("added likes",data)
  }).catch(function(err){
    console.log("errr", err);
  })
})

app.post('/cmtlikes',function(req,res){
  console.log('############ in cmtlikessss', req.body)
  knex('comments')
  .where({ id: req.body.commentId})
  .update({ likes: req.body.like})
  .then(function(data){
    console.log("added likes",data)
  }).catch(function(err){
    console.log("errr", err);
  })
})

app.get('/questions',function(req,res){
  knex.select('*').from('questions')
  .then(function (table) {
    res.status(200).json(table)
  })
  .catch(function(err){
    console.log('this is a get/messages error', err)
  })
})


app.post('/questions',function(req,res){
  console.log("Helllo U r in Questions post", req.body)
  knex('questions').insert({content: req.body.content})
  .then(function () {
    console.log('this was added')
    res.status(201).end()
  })
})

app.get('/users',function(req,res){
  knex("user").select().then(function (users) {
    if(users != 0){
      res.status(200).json(users)  
    }
  })
})

app.get('/sessions',function(req,res){
  console.log('Cookies: ', req.cookies.sessionId)
  knex("sessions")
  .select('userId')
  .where('sessionId', req.cookies.sessionId)
  .then(function (id) {
      res.status(200).json(id)  
  })
})

app.post('/user',function(req,res){
  console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$', req.body.userId)
  knex("user")
  .select('*')
  .where('id', req.body.userId)
  .then(function (users) {
      res.status(200).json(users)  
  })
})

app.get('/Answers',function(req,res){
 knex('Questions')
.join('Answers', 'Questions.id', '=', 'Answers.qid')
.select('Questions.id', 'Questions.Content','Answers.id','Answers.Answer','Answers.qid ')
 .then(function (table) { 
    res.status(200).json(table)
  })
  .catch(function(err){
    console.log('this is a get/messages error', err)
  })
 })

app.post('/Answers',function(req,res){
   console.log('Answersssssss Knex', req.body)
  knex.insert({Answer:req.body.answer, qid:req.body.content}).into('Answers')
  .then(function () {
    console.log('this was added')
    res.status(201).end()
  })
})

app.post('/signout',function(req,res){
	if(req.cookies.sessionId){
		knex("sessions").where({sessionId:req.cookies.sessionId}).del().then(function () {
			res.clearCookie("sessionId")
			console.log("deleted")
			res.status(200).end()
		})
	}
})


app.listen(3000)
console.log("Listening on port 3000")

module.exports = app;

