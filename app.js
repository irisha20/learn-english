//jshint esversion:6



const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-irit:Test123@cluster0-vgbk1.mongodb.net/englishDB", {useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false });




const verbsSchema = new mongoose.Schema({
  translation: String,
  v1:{type:String, uppercase: true},
  v2:{type:String, uppercase: true},
  v3:{type:String, uppercase: true},
  v2Res:{type:String, uppercase: true},
  v3Res:{type:String, uppercase: true},
  translationRes: String,
  check:String
});

const Verb = mongoose.model("Verb", verbsSchema);



const responsesSchema = new mongoose.Schema({
  translation: String,
  v1:{type:String, uppercase: true},
  v2:{type:String, uppercase: true},
  v3:{type:String, uppercase: true}

});

const Response = mongoose.model("Response", responsesSchema);






// const verb1 = new Verb({
//   translation:"ללמד",
//   v1: "Teach",
//   v2:"Taught",
//   v3:"Taught"
// });
//
// const verb2 = new Verb({
//   translation:"לקבל",
//   v1: "Get",
//   v2:"Got",
//   v3:"Gotten"
// });
//
// const verb3 = new Verb({
//   translation:"לפרוש",
//   v1:"Quit",
//   v2:"Quit",
//   v3:"Quit",
//
// });
//
// const defaultVerbs = [verb1, verb2, verb3];


app.get("/",function(req,res){

  Verb.find(function(err, foundItems){

      res.render("home", {newVerbs: foundItems});
    });



    Verb.updateMany({},{$set: {v2Res:"",    v3Res:"",    translationRes:"",check:"" }}, function(err, affected){
      //  console.log('affected: ', affected);
    });

});




app.get("/verbs",function(req,res){
//console.log(res.body);
//console.log(req.headers.referer);
//console.log(req.headers);

// if (req.headers.referer=== "http://localhost:3000/"){
//   Verb.find( function(err, foundItems){
//
//
//     res.render("verbs", {newVerbs: foundItems,checkAnswer:"",itemTranslation:"",itemV2:"",itemV3:""});
//   });} else

  Verb.find( function(err, foundItems){


    res.render("verbs", {referer:req.headers.referer,newVerbs: foundItems,checkAnswer:"",itemTranslation:"",itemV2:"",itemV3:""});
    // console.log(foundItems.translationRes);
    // console.log(foundItems.v2Res);
    // console.log(foundItems.v3Res);
  });


  });






app.post("/add",function(req,res){

  const translation = req.body.translationInsert;
  const v1 = req.body.verb1;
  const v2 = req.body.verb2;
  const v3 = req.body.verb3;


  const addedVerb = new Verb({
    translation:translation,
    v1:v1,
    v2:v2,
    v3:v3
  });

  addedVerb.save(function(err){
  if (!err){res.redirect("/")}else{
    console.log(err);
  }
  });



});



app.post("/checkAll",function(req,res){

  const translation = req.body.translation;
  const v2 = req.body.v2;
  const v3 = req.body.v3;
const checkedItemId = req.body.check;
//console.log(translation,v2,v3,checkedItemId);

//Verb.findOneAndUpdate({_id:checkedItemId}, { $set: { "v2Res" : v2, "v3Res":v3,"translationRes":translation } });



Verb.findOneAndUpdate({_id:checkedItemId}, { $set: { v2Res: v2,v3Res:v3,translationRes:translation }},function(err,found){
//console.log(found);

});


Verb.findOne({_id:checkedItemId},function(err,foundItem){
// console.log( _.lowerCase(foundItem.v2));
// console.log(_.lowerCase(v2));
// console.log(_.lowerCase(foundItem.v3));
// console.log(_.lowerCase(v3));
// console.log(foundItem.translation);
// console.log(translation);


if ( _.lowerCase(foundItem.v2)===_.lowerCase(v2) &&  _.lowerCase(foundItem.v3)===_.lowerCase(v3) && foundItem.translation===translation){
console.log("Well Done");
Verb.findOneAndUpdate({_id:checkedItemId}, { $set: { check:"✅" }},function(err,found){
//console.log(checkedItemId);

});



res.redirect("/verbs"+"#"+checkedItemId);



}
else
{
console.log("There are errors");
Verb.findOneAndUpdate({_id:checkedItemId}, { $set: { check:"❌" }},function(err,found){
//console.log(found);

});

res.redirect("/verbs"+"#"+checkedItemId);

}

});

});



app.post("/check",function(req,res){

  const translation = req.body.translation;
  const v2 = req.body.v2;
  const v3 = req.body.v3;
const checkedItemId = req.body.check;
//console.log(translation,v2,v3,checkedItemId);

//Verb.findOneAndUpdate({_id:checkedItemId}, { $set: { "v2Res" : v2, "v3Res":v3,"translationRes":translation } });



Verb.findOneAndUpdate({_id:checkedItemId}, { $set: { v2Res: v2,v3Res:v3,translationRes:translation }},function(err,found){
//console.log(found);

});


Verb.findOne({_id:checkedItemId},function(err,foundItem){
// console.log( _.lowerCase(foundItem.v2));
// console.log(_.lowerCase(v2));
// console.log(_.lowerCase(foundItem.v3));
// console.log(_.lowerCase(v3));
// console.log(foundItem.translation);
// console.log(translation);


if ( _.lowerCase(foundItem.v2)===_.lowerCase(v2) &&  _.lowerCase(foundItem.v3)===_.lowerCase(v3) && foundItem.translation===translation){
console.log("Well Done");
Verb.findOneAndUpdate({_id:checkedItemId}, { $set: { check:"✅" }},function(err,found){
//console.log(checkedItemId);

});



res.redirect("/verbs"+"#"+checkedItemId);


// Verb.find({},function(err,foundItems){
//
// res.render("verbs",{newVerbs: foundItems,checkAnswer:"✅",itemTranslation:foundItems.translationRes,itemV2:foundItems.v2Res,itemV3:foundItems.v3Res});
//
// });
}
else
{
console.log("There are errors");
Verb.findOneAndUpdate({_id:checkedItemId}, { $set: { check:"❌" }},function(err,found){
//console.log(found);

});

res.redirect("/verbs"+"#"+checkedItemId);
  // Verb.find({},function(err,foundItems){
  //
  // res.render("verbs",{newVerbs: foundItems,checkAnswer:"❌",itemTranslation:translation,itemV2:v2,itemV3:v3})
  //
  // });

}

});

});


app.post("/delete", function(req, res){
  const checkedVerbId = req.body.checkbox;


  Verb.findByIdAndRemove(checkedVerbId, function(err){
    if (!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
});

app.get("/", function(req, res) {

  // Item.find({}, function(err, foundItems){
  //
  //   if (foundItems.length === 0) {
  //     Item.insertMany(defaultItems, function(err){
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         console.log("Successfully savevd default items to DB.");
  //       }
  //     });
  //     res.redirect("/");
  //   } else {
  //     res.render("list", {listTitle: "Today", newListItems: foundItems});
  //   }
  // });

});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
