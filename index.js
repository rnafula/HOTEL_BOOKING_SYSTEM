const express = require("express");
const path = require("path");
const app = express();
//middleware
app.use(express.static(path.join(__dirname, "public"))); //path -- nested routes /booking/user/id
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
