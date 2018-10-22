const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const stripTags = require("striptags");
const methodOverride = require("method-override");

const app = express();

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

//bring in models
require("./models/User");
require("./models/Story");

//bring in keys
const keys = require("./config/keys");

//bring in hbs helpers
const { truncate, formatDate, select, editIcon } = require("./helpers/hbs");

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
app.engine(
  "handlebars",
  exphbs({
    helpers: {
      truncate: truncate,
      stripTags: stripTags,
      formatDate: formatDate,
      select: select,
      editIcon: editIcon
    },
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

//connect path
app.use(express.static(path.join(__dirname, "public")));

//connect routes
const auth = require("./routes/auth");
const index = require("./routes/index");
const stories = require("./routes/stories");

const port = process.env.PORT || 5000;

app.use("/auth", auth);
app.use("/", index);
app.use("/stories", stories);

app.listen(port, () => {
  console.log(`app started on port ${port}`);
});
