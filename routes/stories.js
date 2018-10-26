const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("users");
const Story = mongoose.model("stories");
const { ensureAuthenticated } = require("../helpers/auth");

//stories index
router.get("/", (req, res) => {
  Story.find({ status: "public" })
    .sort({ date: "desc" })
    .populate("user")
    .then(stories => {
      res.render("stories/index", {
        stories: stories
      });
    })
    .catch(err => console.log(err));
});

//add stories
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("stories/add");
});

//edit stories
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({ _id: req.params.id })
  .populate('user')
    .then(story => {
      if(req.user){
        if(req.user.id==story.user._id){
          res.render("stories/edit", {
            story: story
          });
        }else{
          res.redirect('/stories')
        }
      }
      
    })
    .catch(err => console.log(err));
});

//process add POST
router.post("/", (req, res) => {
  let allowComments = [];
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newStory = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  };
  new Story(newStory)
    .save()
    .then(story => {
      res.redirect(`/stories/show/${story.id}`);
    })
    .catch(err => console.log(err));
});

//list stories from a user
router.get("/show/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
    .populate("user")
    .populate("comments.commentUser")
    .then(story => {
      if (story.status == "public") {
        res.render("stories/show", {
          story: story
        });
      } else {
        if (req.user) {
          if (req.user.id == story.user._id) {
            res.render("stories/show", {
              story: story
            });
          } else {
            res.redirect("/stories");
          }
        } else {
          res.redirect("/stories");
        }
      }
    });
});

//process  single user story
router.get("/user/:userId", (req, res) => {
  Story.find({ user: req.params.userId, status: "public" })
    .populate("user")
    .then(stories => {
      res.render("stories/index", {
        stories: stories
      });
    });
});

//process my stories route
router.get("/my", ensureAuthenticated, (req, res) => {
  Story.find({ user: req.user.id })
    .populate("user")
    .then(stories => {
      res.render("stories/index", {
        stories: stories
      });
    });
});

//process update story PUT request
router.put("/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({ _id: req.params.id })
    .then(story => {
      let allowComments = [];
      if (req.body.allowComments) {
        allowComments = true;
      } else {
        allowComments = false;
      }

      (story.title = req.body.title),
        (story.body = req.body.body),
        (story.status = req.body.status),
        (story.allowComments = allowComments);

      story.save().then(story => {
        res.redirect("/dashboard");
      });
    })
    .catch(err => console.log(err));
});

//process delete story DELETE request
router.delete("/:id", (req, res) => {
  Story.deleteOne({ _id: req.params.id }).then(() => {
    res.redirect("/dashboard");
  });
});

//process comments route
router.post("/comment/:id", (req, res) => {
  Story.findOne({ _id: req.params.id }).then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    };

    //add to db
    story.comments.unshift(newComment);
    story.save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  });
});

module.exports = router;
