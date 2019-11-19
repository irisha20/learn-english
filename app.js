//jshint esversion:6



const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
var async = require("async");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-irit:Test123@cluster0-vgbk1.mongodb.net/englishDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});


//Schema for verbs

const verbsSchema = new mongoose.Schema({
  translation: String,
  v1: {
    type: String,
    uppercase: true
  },
  v2: {
    type: String,
    uppercase: true
  },
  v3: {
    type: String,
    uppercase: true
  },
  v2Res: {
    type: String,
    uppercase: true
  },
  v3Res: {
    type: String,
    uppercase: true
  },
  translationRes: String,
  check: String
});

const Verb = mongoose.model("Verb", verbsSchema);


//schema for words

const wordsSchema = new mongoose.Schema({
  translation: String,
  word: {
    type: String,
    uppercase: true
  },
  wordRes: {
    type: String,
    uppercase: true
  },
  check: String
});

const Word = mongoose.model("Word", wordsSchema);





//schema for dictation

const dictationSchema = {
  name: String,
  words: [wordsSchema]
};

const Dictation = mongoose.model("Dictation", dictationSchema);



app.get("/", function(req, res) {

  //clears verbs database responses once HP clicked

  Verb.updateMany({}, {
    $set: {
      v2Res: "",
      v3Res: "",
      translationRes: "",
      check: ""
    }
  }, function(err, affected) {
    //  console.log('affected: ', affected);
    console.log("Responses Verbs cleared");
  });


  //clears dictation database wordRes (words user inserted for checkup) responses once HP clicked

  Dictation.updateMany({}, {
    $set: {
      "words.$[el].wordRes": ""
    }
  }, {
    arrayFilters: [{
      "el.wordRes": {
        $gt: 0
      }
    }],
    new: true
  }, function(err, affected) {
    if (!err) {
      console.log("Responses Dictations cleared");



    } else {
      console.log(err);
    }
  });


//clears dictation database check field  once HP clicked
  Dictation.updateMany({}, {
    $set: {
      "words.$[el].check": ""
    }
  }, {
    arrayFilters: [{
      "el.check": {
        $gt: 0
      }
    }],
    new: true
  }, function(err, affected) {
    if (!err) {
      console.log("Responses Checks cleared");



    } else {
      console.log(err);
    }
  });



  // asynchronically renders both parts of the HP: verbs table + dynamically created dictations list
  var locals = {};
  async.parallel([
    //load verbs data
    function(callback) {
      Verb.find({}, function(err, verbs) {
        if (err) return callback(err);
        locals.verbs = verbs;
        callback();
      });
    },
    //Load dictations created dynamically data
    function(callback) {
      Dictation.find({}, function(err, dictations) {
        if (err) return callback(err);
        locals.dictations = dictations;
        callback();
      });
    }
  ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
    if (err) return next(err);

    res.render("home", {
      newVerbs: locals.verbs,
      newDictations: locals.dictations
    });

  });
});



//shows verbs page for check with missing fields to be filled by user
app.get("/verbs", function(req, res) {

  Verb.find(function(err, foundItems) {
    res.render("verbs", {
      referer: req.headers.referer,
      newVerbs: foundItems,
      checkAnswer: "",
      itemTranslation: "",
      itemV2: "",
      itemV3: ""
    });
  });
});





//adds and saves new added verb, adds to Verb Model
app.post("/add", function(req, res) {

  const translation = req.body.translationInsert;
  const v1 = req.body.verb1;
  const v2 = req.body.verb2;
  const v3 = req.body.verb3;


  const addedVerb = new Verb({
    translation: translation,
    v1: v1,
    v2: v2,
    v3: v3
  });

  addedVerb.save(function(err) {
    if (!err) {
      res.redirect("/")
    } else {
      console.log(err);
    }
  });



});



//adds word to a specific dictation created dynamically
app.post("/addWord2Dictation", function(req, res) {



  const translation = req.body.translationInsertWord;
  const word = req.body.word;
  const customVocabulary = req.body.dictationTitle;



  const addedword2Dictation = new Word({
    translation: translation,
    word: word
  });


  Dictation.findOne({
    name: customVocabulary
  }, function(err, foundList) {
    foundList.words.push(addedword2Dictation);
    foundList.save();
    res.redirect("/" + customVocabulary);
  });

});



app.post("/checkAll", function(req, res) {

  const translation = req.body.translation;
  const v2 = req.body.v2;
  const v3 = req.body.v3;
  const checkedItemId = req.body.check;
  //console.log(translation,v2,v3,checkedItemId);

  //Verb.findOneAndUpdate({_id:checkedItemId}, { $set: { "v2Res" : v2, "v3Res":v3,"translationRes":translation } });



  Verb.findOneAndUpdate({
    _id: checkedItemId
  }, {
    $set: {
      v2Res: v2,
      v3Res: v3,
      translationRes: translation
    }
  }, function(err, found) {
    //console.log(found);

  });


  Verb.findOne({
    _id: checkedItemId
  }, function(err, foundItem) {
    // console.log( _.lowerCase(foundItem.v2));
    // console.log(_.lowerCase(v2));
    // console.log(_.lowerCase(foundItem.v3));
    // console.log(_.lowerCase(v3));
    // console.log(foundItem.translation);
    // console.log(translation);


    if (_.lowerCase(foundItem.v2) === _.lowerCase(v2) && _.lowerCase(foundItem.v3) === _.lowerCase(v3) && foundItem.translation === translation) {
      console.log("Well Done");
      Verb.findOneAndUpdate({
        _id: checkedItemId
      }, {
        $set: {
          check: "✅"
        }
      }, function(err, found) {
        //console.log(checkedItemId);

      });



      res.redirect("/verbs" + "#" + checkedItemId);



    } else {
      console.log("There are errors");
      Verb.findOneAndUpdate({
        _id: checkedItemId
      }, {
        $set: {
          check: "❌"
        }
      }, function(err, found) {
        //console.log(found);

      });

      res.redirect("/verbs" + "#" + checkedItemId);

    }

  });

});




// checks verbs and sets "correct" or "wrong" response

app.post("/check", function(req, res) {

  const translation = req.body.translation;
  const v2 = req.body.v2;
  const v3 = req.body.v3;
  const checkedItemId = req.body.check;



//find the verb according clicked id, sets responses of the user in the database
  Verb.findOneAndUpdate({
    _id: checkedItemId
  }, {
    $set: {
      v2Res: v2,
      v3Res: v3,
      translationRes: translation
    }
  }, function(err, found) {
    //console.log(found);

  });

// if response equals the original value, field "check" gets "✅ else ❌
  Verb.findOne({
    _id: checkedItemId
  }, function(err, foundItem) {


    if (_.lowerCase(foundItem.v2) === _.lowerCase(v2) && _.lowerCase(foundItem.v3) === _.lowerCase(v3) && foundItem.translation === translation) {
      console.log("Well Done");
      Verb.findOneAndUpdate({
        _id: checkedItemId
      }, {
        $set: {
          check: "✅"
        }
      }, function(err, found) {
        //console.log(checkedItemId);

      });

      res.redirect("/verbs" + "#" + checkedItemId);
    } else {
      console.log("There are errors");
      Verb.findOneAndUpdate({
        _id: checkedItemId
      }, {
        $set: {
          check: "❌"
        }
      }, function(err, found) {
        //console.log(found);

      });
//redirects to /verb in the specific location of the item
      res.redirect("/verbs" + "#" + checkedItemId);
    }

  });

});


//creates/shows dynamically created dictation  i.e /ROOT/fruits

app.get("/:customVocabulary", function(req, res) {
  const customVocabulary = _.capitalize(req.params.customVocabulary);

  Dictation.findOne({
    name: customVocabulary
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new dictation
        const dictation = new Dictation({
          name: customVocabulary
          // words:defaultWords

        });
        dictation.save();
        res.redirect("/" + customVocabulary);
        //res.render("dictation", {dictationTitle: foundList.name, newDictationWords: foundList.words,checkAnswer:""});
      } else {
        //Show an existing list

        res.render("dictation", {
          dictationTitle: foundList.name,
          newDictationWords: foundList.words,
          checkAnswer: ""
        });
      }
    }
  });



});


//create page for checkup, for related dictation, ie: for dictation fruits /ROOT/fruits check page is /ROOT/checkWords/fruits -
//all created dynamically. we don't know which dictation subject user adds
app.get("/checkWords/:customVocabulary", function(req, res) {
  const customVocabulary = _.capitalize(req.params.customVocabulary);

  Dictation.findOne({
    name: customVocabulary
  }, function(err, foundDict) {
    if (!err) {

      //Show an existing list

      res.render("dictationCheck", {
        dictationTitle: foundDict.name,
        newDictationWords: foundDict.words
      });

    }
  });



});



//from each dictation check, leads to check the related words
//more complecated since Dictation schema has one field of string and another of words array
app.post("/checkWords", function(req, res) {


  const dictationTitle = req.body.dictationTitle;
  const word = req.body.word;
  const checkedItemId = req.body.check;



  Dictation.findOneAndUpdate({
    name: dictationTitle
  }, {
    $set: {
      "words.$[el].wordRes": word
    }
  }, {
    arrayFilters: [{
      "el._id": checkedItemId
    }],
    new: true
  }, function(err, found) {
    if (!err) {
      console.log("WordRes recorded");

      Dictation.findOneAndUpdate({
          name: dictationTitle
        },


        {
          $set: {
            "words.$[el].check": "✅"
          }
        }, {
          arrayFilters: [{
            "el._id": checkedItemId
          }],
          new: true
        },
        function(err, found) {
          if (!err) {
            console.log("OK");


            found.words.forEach(function(item) {
              // console.log(item.check);
              if (item._id == checkedItemId && item.word == item.wordRes) {

                // res.render("dictationCheck", {dictationTitle: found.name, newDictationWords: found.words,checkAnswer:item.check});
                res.redirect("checkWords/" + dictationTitle + "#" + checkedItemId)

              } else if (item._id == checkedItemId && item.word != item.wordRes) {

                console.log("wrong");
                console.log(item._id, checkedItemId, item.word, item.wordRes);

                Dictation.findOneAndUpdate({
                    name: dictationTitle
                  }, {
                    $set: {
                      "words.$[el].check": "❌"
                    }
                  }, {
                    arrayFilters: [{
                      "el._id": checkedItemId
                    }],
                    new: true
                  }, function(err, found) {
                    if (!err) {
                      res.redirect("checkWords/" + dictationTitle + "#" + checkedItemId);
                    }

                  }



                );

              }

            });


          } else {
            console.log(err);
          }
        }


      );


    } else {
      console.log(err);
    }
  });

});



//deletes verbs from full list
app.post("/delete", function(req, res) {
  const checkedVerbId = req.body.buttonDelete;


  Verb.findByIdAndRemove(checkedVerbId, function(err) {
    if (!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
});

//deletes word from dictation
app.post("/deleteWordfromDictation", function(req, res) {
  const checkedWordId = req.body.buttonDelete;
  //const customVocabulary = _.capitalize(req.params);
  const customVocabulary = req.body.dictationTitle;



  Dictation.findOneAndUpdate({
    name: customVocabulary
  }, {
    $pull: {
      words: {
        _id: checkedWordId
      }
    }
  }, function(err, foundList) {
    if (!err) {

      res.redirect("/" + customVocabulary);
    } else {
      console.log(err);
    }
  });


});

//deletes whole dictation
app.post("/deleteDictation", function(req, res) {
  const checkedDictationId = req.body.buttonDelete;


  Dictation.findByIdAndRemove(checkedDictationId, function(err) {
    if (!err) {
      console.log("Successfully deleted dictation.");
      res.redirect("/");
    }
  });

});



//database connect mongoose or Local
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
