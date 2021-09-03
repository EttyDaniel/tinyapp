const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { query } = require("express");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

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

const isURLOwnedByUser = function(url, userId) {
  return urlDatabase[url].userId === userId;
};


const urlsForUser = function (id) {
  const urls = {};
  for (shortURL in urlDatabase ) {
    if (urlDatabase[shortURL].userId === id) {
      const long = urlDatabase[shortURL].longURL;
      urls[shortURL] =  {longURL: long, userId: id};
    }
  }
  return urls;
};

/*----------------------------------------------------------
        GLOBAL Application Data
*/
//----------------------------------------------------------

let templateVars = {};
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: "aa1"},
  "9sm5xK": {longURL: "http://www.google.com", userId: "aa2"}
};

//The tinyApp Users
let users = {
  "aa1" : {
    id: "aa1",
    email: "yaya@gmail.com",
    password: "$2b$10$2uJXf7z0pdTLedx1Dudv4ump/ctwspwqiUmeNKDV/O9IDKzHs2sMm" //Kal888
  },
  "aa2" : {
    id: "aa2",
    email: "lilcat@yahoo.com",
    password: "$2b$10$0lU03rBdZiRUfhVbx35Bs.g9W9P2qSrd6wQGJrMP2t.02n/6M42o2" //cat@cat
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
  console.log(user);
  if (user) {
    const urls = urlsForUser(userId);
    console.log(urls);
    templateVars = {urls, user};
    //templateVars = {urls: urlDatabase, user};
    res.render("urls_index", templateVars);
  } else {
    res.status(402).send("Please Login or Register first");
  }
  // templateVars = {urls: urlDatabase, user};
  // res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  
  const userId = req.cookies['user_id'];
  if (userId) {
    const user = users[userId];
    templateVars = {user};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

  
});

app.post("/urls/:id/update", (req, res) => {
  if (isURLOwnedByUser(req.params.id, req.cookies['user_id'])) {
    urlDatabase[req.params.id].longURL = req.body.updatedLongURL;
    res.redirect("/urls");
  } else {
    res.send("User does not have proper permission to update this URL")
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (isURLOwnedByUser(req.params.shortURL, req.cookies['user_id'])) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send("User does not have proper permission to delete this URL")
  }
});

app.get("/urls/:shortURL", (req,res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  // Check for an edge case where the URL is not in the system
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.send("The provided URL does not exist in the system");
    // Only display the shortend URL page for the user who owns it
  } else if (isURLOwnedByUser(req.params.shortURL, userId)) {
    templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user};
    res.render("urls_show", templateVars);
  } else {
    res.send("Access Denied, URL does not belong to the current user");
  }
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
  urlDatabase[shortURL] = {longURL:req.body.longURL, userId:req.cookies['user_id']};

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
  } else if (!(bcrypt.compareSync(req.body.psw, users[id].password))) {
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
      "password": bcrypt.hashSync(password, 10)
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