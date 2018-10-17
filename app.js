const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");

const app = express();

//bring in model
require("./models/User");

//bring in keys
const keys = require("./config/keys");

//connect mongoose
mongoose
  .connect(
    keys.mongoURI,
    {
      useNewUrlParser: true
    }
  )
  .then(() => console.log("mongodb connected"))
  .catch(err => console.log(err));

//passport config
require("./config/passport")(passport);
//init express

//init express session and cookie parse
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//express handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//connect routes
const auth = require("./routes/auth");
const index = require("./routes/index");

const port = process.env.PORT || 5000;

app.use("/auth", auth);
app.use("/", index);

app.listen(port, () => {
  console.log(`app started on port ${port}`);
});
