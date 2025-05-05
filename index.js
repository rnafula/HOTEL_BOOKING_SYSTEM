const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
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
app.use(
  session({
    secret: "weekend",
    resave: false,
    saveUninitialized: true,
  })
);

//authorization middleware
const superAdminRoutes = ["/newSpot", "/newRoom", "/checkout"];
const managerRoutes = ["/addReception", "/roomUpdates"];
const receptionRoutes = ["/checkin", "/roomUpdates"];

//all others are public routes
app.use((req, res, next) => {
  if (req.session.user) {
    //user logged in - check role
    const userRole = req.session.user.role; //gets user role from session
    if (userRole === "superadmin") {
      //super admin - allow access to all routes
      next();
    } else if (userRole === "reception" && receptionRoutes.includes(req.path)) {
      //reception - allow access to reception routes
      next();
    } else if (userRole === "manager" && managerRoutes.includes(req.path)) {
      //manager - allow access to manager routes
      next();
    } else {
      res.status(401).send("Unauthorized access - 401");
    }
  } else {
    //user not logged in - redirect to login page
    if (
      superAdminRoutes.includes(req.path) ||
      receptionRoutes.includes(req.path) ||
      managerRoutes.includes(req.path)
    ) {
      res.status(401).send("Unauthorized  - 401");
    } else {
      next();
    }
  }
});

//routes
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
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/newSpot", (req, res) => {
  res.render("newSpot.ejs");
});
app.get("/newRoom", (req, res) => {
  res.render("newRoom.ejs");
});
app.get("/checkout", (req, res) => {
  res.render("checkout.ejs");
});
app.get("/checkin", (req, res) => {
  res.render("checkin.ejs");
});
app.get("/roomUpdates", (req, res) => {
  res.render("roomUpdate.ejs");
});
app.get("/addReception", (req, res) => {
  res.render("addReception.ejs");
});
app.get("/roomUpdates", (req, res) => {
  res.render("roomUpdates.ejs");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  dbconnection.query(
    `SELECT * FROM users WHERE email="${email}"`,
    (error, userData) => {
      if (error) {
        res.status(500).send("Server Error: 500");
      } else {
        if (userData.length == 0) {
          res.status(401).send("User not found");
        } else {
          //user found - compare password using bcrypt
          const user = userData[0];
          const isPasswordValid = bcrypt.compareSync(password, user.password);
          if (isPasswordValid) {
            //password is valid - create session
            req.session.user = user;
            res.send("Login successful - Valid password");
          } else {
            res.status(401).send("Invalid password");
          }
        }
      }
    }
  );
});
console.log(bcrypt.hashSync("admin123", 10));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
