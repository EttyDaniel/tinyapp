const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { query } = require("express");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

app.use(cookieParser())

//-------------------------------------------------------
/*
      ASSISTING FUNCTIONS
*/
//-------------------------------------------------------


const generateRandomString = function() {
  // Generate a random number, convert it to a string using
  // a radix of 36 (which will include all alph-numericals)
  // then cut a 6 char substring.
  return Math.random().toString(36).substr(2, 6)
};

const emailExists = function(emailFromUser) {
  for (let id in users) {
    if(users[id].email === emailFromUser) {
      console.log("email exists");
      return true;
    }
  }
  return false;
};

const findUser = function(emailFromUser) {
  for (let id in users) {
    if(users[id].email === emailFromUser) {
      return id;
    }
  }
  //email was not found
  return "";
};

/*----------------------------------------------------------
        GLOBAL Application Data
*/
//----------------------------------------------------------

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: "aa1"},
  "9sm5xK": {longURL: "http://www.google.com", userId: "aa2"}
};

//The tinyApp Users
let users = {
  "aa1" : {
    id: "aa1",
    email: "yaya@gmail.com",
    password: "Kal888"
  },
  "aa2" : {
    id: "aa2",
    email: "lilcat@yahoo.com",
    password: "cat@cat"
  }
};
//----------------------------------------------------------

//Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//HTML presented in the browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req,res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  templateVars = {user};
  res.render("register", templateVars);
});

app.get("/login", (req,res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  templateVars = {user};
  res.render("login", templateVars);
});

//pass the URL data to our template.
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const templateVars = {urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  
  const userId = req.cookies['user_id'];
  if (userId) {
    const user = users[userId];
    const templateVars = {user};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

  
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.updatedLongURL;//*
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req,res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req,res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;//*
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console

  // Generate a random 6 char string
  const shortURL = generateRandomString();

  // Save generated shortURL into our DB
  urlDatabase[shortURL].longURL = req.body.longURL;//*

  // Redirect the browser to the shortURL
  res.redirect(`/urls/${shortURL}`);
});

/*The Login route - it uses the new email and password fields,
 and sets an appropriate user_id cookie on successful login
*/
app.post("/login", (req,res) => {
  
  const emailFromUser = req.body.email;
  let id = findUser(emailFromUser);
  if (!id) {
    res.status(403);
    res.send("Email doesn't exists");
  } else if (!(users[id].password === req.body.psw)) {
    res.status(403);
    res.send("Password is incorrect");
  }

  res.cookie("user_id",id);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//registering a new user to tinyApp
app.post("/register", (req,res) => {

  let newUser = {};
  const email = req.body.email;
  const password = req.body.psw;
  if (email ==="" || password === "" || emailExists(email)) {
    res.status(400);
    res.send("Email already exists");
  } else {
    const id = generateRandomString();
    newUser = {
      "id": id,
      "email": email,
      "password": password
    };
    users[id] = newUser;

    res.cookie("user_id", id);
  }
  //res.cookie("user_id", id);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});