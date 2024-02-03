var express = require('express');
var router = express.Router();
const userModel= require("./users");
const postModel=require("./post");
const passport= require("passport");
const upload= require("./multer");
const localStrategy= require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get("/login",function(req,res,next){
  console.log(req.flash("error"));
  res.render("login",{error:req.flash("error")});
})

router.post('/upload', isLoggedIn,upload.single("file"),async function(req, res, next) {
  if(!req.file){
    return res.status('404').send('No files were uploaded')
  }
  // to save upload file as a post and handle its post id to user and  send  userid to post 
  const user= await userModel.findOne({
    //fetching current logged in user
    username:req.session.passport.user
  })
  const postdata= await postModel.create({
    image: req.file.filename,
    imageText:req.body.filecaption,
    user: user._id
  })

  //pushing post id to the user 
  user.posts.push(postdata._id);
  await user.save();
  res.redirect("/profile")
});
router.get("/profile",isLoggedIn, async function(req,res,next){
  const user= await userModel.findOne({
    username: req.session.passport.user

  })
  //showing post in the profile 
  .populate("posts")
  console.log(user );

  res.render("profile",{user})
})
router.get("/feed",function(req,res,next){
  res.render("feed")
})

router.post("/register",function(req,res,next){
  const userData = new userModel({
    username: req.body.username,    
    email: req.body.email,
    fullname: req.body.fullname,
  });
userModel.register(userData, req.body.password).then(function(){
  passport.authenticate("local")(req,res,function(){
    res.redirect("/profile")
  })
})

})
router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash:true
}),function(req,res){
})

router.get("/logout",function(req,res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}
// router.get('/createuser',async  function(req, res, next) {
//  let createduser= await  userModel.create({
//     username: "utkarsh",
//     password: "utkarsh",
//     posts: [],
//     email: "utkarsh@ecample.com",
//     fullname:"Utkarsh ",
//   })
//   res.send(createduser)
// });

// router.get("/alluserpost", async function(req,res,next){
//  let user= await userModel.findOne({_id:"65aea8b36e802492ceb75a75"}).populate("posts")
//  res.send(user)
// })

// router.get("/createpost",async function(req,res,next){
//   let createdpost = await postModel.create({
//     postText: "Hello Dev",

//     //to save userId 
//     user:"65aea8b36e802492ceb75a75"
//   });
//   let user = await userModel.findOne({
//     _id:"65aea8b36e802492ceb75a75"
//   });

//   user.posts.push(createdpost._id);
//   await user.save();
//   res.send("done")
// })

module.exports = router;
