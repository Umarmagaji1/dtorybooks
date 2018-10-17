const express = require("express");
const passport = require("passport");

//passport config
require("./config/passport")(passport);

//connect routes
const auth = require("./routes/auth");
//init express
const app = express();

const port = process.env.PORT || 5000;

//get home
app.get("/", (req, res) => {
  res.send("it works!");
});

app.use("/auth", auth);

app.listen(port, () => {
  console.log(`app started on port ${port}`);
});
