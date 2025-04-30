const express = require("express");
const path = require("path");

const mysql = require("mysql");
const dbconnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hotel_db",
});

const app = express();
//middleware
app.use(express.static(path.join(__dirname, "public"))); //path -- nested routes /booking/user/id
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  dbconnection.query("SELECT * FROM rooms", (roomsSelectError, rooms) => {
    if (roomsSelectError) {
      res.status(500).send("Server Error: 500");
    } else {
      dbconnection.query("SELECT * FROM spots", (spotsSelectError, spots) => {
        if (spotsSelectError) {
          res.status(500).send("Server Error: 500");
        } else {
          console.log(spots);
          res.render("index.ejs", { rooms, spots });
        }
      });
    }
  });
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
