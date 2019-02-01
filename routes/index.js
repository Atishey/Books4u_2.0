//npm run devstart in terminal

var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID; 
var MongoClient = require('./db.js');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');

 

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('welcome',{title:'Welcome:)'});
});

router.get('/login',function(req,res,next){
  res.render('login',{title:'Please login your details'});
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Books4u' });
});

router.get('/pad',function(req,res,next){
  res.render('pad',{title:'Post Ad!!!'});
});

router.get('/logout',function(req,res,next){
  res.render('logout',{title:'Please login your details'});
});

router.get('/home', function(req, res, next) {  
  res.render('home', { title: 'Books4u' });
});

router.get('/home/:id',function(req,res,next){
  MongoClient.connectToServer(function(err){    
    var db = MongoClient.getDb();
    var url = ObjectID(req.params.id);
    // var u = url;
    db.collection("users").findOne({_id:url},function(err,user){
      console.log(user)      
      res.render('home',{users:user,books:user.books,url:url});        
    });     
      
  });
});



router.post('/signup', function(req, res, next){
  var obj = JSON.stringify(req.body);  
  var jsonObj =JSON.parse(obj);
  MongoClient.connectToServer(function(err){
    if(err)
      console.log(err);
    var db = MongoClient.getDb();
    db.collection("users").findOne({name:req.body.username},function(err,user){
      // console.log(req.body.username);
      if(user === null){      
        
        var pass = req.body.password;
        bcrypt.hash(pass,10,function(err,hash){
          var obj = {
            "name":req.body.username,            
            "password":hash,
            "ph_no":req.body.phone,
            "email":req.body.email,
            "Semester":req.body.semester,
            "buyer":false,
            "seller":false,
            "books":[]
          }
          // jsonObj = JSON.parse(obj);
          db.collection("users").insertOne(obj,function(err,res1){
            if(err) throw err;
            console.log("User created");
            res.redirect('/login');
            // db.close();
          });
        });
        
      }
      else {
        console.log("Username exists!!!")
        res.send({"Error":"Username exists"});
      }

    });
    
  });   
    
});

router.get('/all',function(req,res,next){
  MongoClient.connectToServer(function(err){
    if(err)
      console.log(err);
    var db = MongoClient.getDb();
    console.log(req.query.id);
    var id = ObjectID(req.query.id);
    // var hex = /[0-9A-Fa-f]{6}/g;
    // id = (hex.test(id))? ObjectID(id) : id; 
    db.collection("users").findOne({_id:id},function(err,uid){
      var sem = uid.Semester;
      // console.log(uid);
      db.collection("users").find({_id:{'$ne':uid._id}}).toArray(function(err,user){
        console.log(user)
        if(user == null)
          res.send({msg:"not..ok"})
        else {
          var arr = []
          var obj = user;
          var book = [];
          for (var i = user.length - 1; i >= 0; i--) {
            // console.log(user[i].books);
            for (var j = user[i].books.length - 1; j >= 0; j--) {
              var obj = {
                uname:user[i].name,
                uph:user[i].ph_no,
                uemail:user[i].email,
                bname:user[i].books[j].name,
                bmrp:user[i].books[j].MRP,
                author:user[i].books[j].author
              }
            }
            arr.push(obj);          
          }
          // console.log(arr);
          res.render('all',{data:arr,url:ObjectID(req.params.id)});
        }
        
    
    });
  });
  
    });


});


// //Login form
router.post('/login', function(req, res, next){
   MongoClient.connectToServer(function(err){
    if(err)
      console.log(err);
    var db = MongoClient.getDb();
    // console.log(req.body);
    db.collection("users").findOne({email:req.body.email},function(err,user){
      // console.log(user);
      if(user == null)
        res.render('login',{login_status:"enter valid credentials"})
      else {
        bcrypt.compare(req.body.password,user.password,function(err,match){
          if(match){    
            
            var users = {
              name:user.name,
              ph_no:user.ph_no,
              email:user.email,
              sem:user.Semester
            }
            // console.log(users) ;
            var url = user._id;        
            res.render('home',{users:users,books:user.books,url:url});              
          }
          else{
            res.redirect('/login',{login_status:"idk"});
          }        
        })        
      }       
        
      
      // db.close();
    });
  });
});
   
//  //Post ad Form     
 router.post('/pad', function(req, res, next){

  MongoClient.connectToServer(function(err){
    if(err)
      console.log(err);
    var db = MongoClient.getDb();      
    
    db.collection("users").findOne({email:req.body.email},function(err,user){
      var obj = {
        "name":req.body.bname,            
        "author":req.body.author,
        "branch":req.body.branch,
        "MRP":req.body.mrp,
        "Semester":req.body.sem            
      }
      var Book_id = null;
      var books = user.books;
      if(user === null)
        res.redirect('/pad');
      else {
          
          // console.log(book_ids);
          db.collection("books").insertOne(obj,function(err,res1){
          if(err) throw err;
            console.log("Book inserted");
            // console.log(res1);            
            books.push(obj);
            // console.log(book_ids);
            if(req.body.want == "sell"){
            // console.log(book_ids)
              var newvalues = {$set:{seller:true,books:books}}
              db.collection("users").updateOne({'_id':ObjectID(user._id)}, newvalues, function(err, res) {
              if (err) throw err;
              console.log("Book update");  
                }); 
            }
            else if(req.body.want === "buy"){

              var newvalues = {$set:{buyer:true,books:books}}
              db.collection("users").updateOne({'_id':ObjectID(user._id)}, newvalues, function(err, res) {
              if (err) throw err;
              console.log("1 document updated buy");
              });
            }      
          });         
          var url = user._id;
          res.render('/login/'+url,{user:user,books:user.books,url:url});              

      }      
    });
    
  });   
    
  });

//Edit form
router.get('/edit/:id', function(req, res, next){
   MongoClient.connectToServer(function(err){
    if(err)
      console.log(err);
    var db = MongoClient.getDb();
    var url = ObjectID(req.params.id);
    console.log(url);
    db.collection("users").findOne({_id:url},function(err,user){
      console.log(user);
      res.render('edit',{user:user,url:url});        
    });      
  });
});

router.post('/editi/:id', function(req, res, next){
   MongoClient.connectToServer(function(err){
    if(err)
      console.log(err);
    var db = MongoClient.getDb();
    var url = ObjectID(req.params.id);
    console.log(req.body);
    // res.render('home',{url:url});
    var newvalue = {$set:{name:req.body.name,ph_no:req.body.ph_no,Semester:req.body.Semester}};
    // console.log()
    db.collection("users").updateOne({_id:url},newvalue,function(err,user){
      console.log(user);
      res.render('home',{users:user,url:url});        
    });       
       
      
      
  });
});




module.exports = router;
  