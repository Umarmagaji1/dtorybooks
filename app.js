const express = require("express");

const app = express();

const port = process.env.PORT || 5000;

//get home
app.get("/", (req, res) => {
  res.send("it works!");
});

app.listen(port, () => {
  console.log(`app started on port ${port}`);
});
