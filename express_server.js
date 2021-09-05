// Include these packages
const express = require("express");
const bodyParser = require("body-parser");
const { query } = require("express");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

// Global variables
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

// Import functions
const {getUserByEmail, generateRandomString, urlsForUser, emailExists, isURLOwnedByUser, getUserById} = require("./helpers");


/*----------------------------------------------------------
        GLOBAL Application Data
*/
//----------------------------------------------------------

let templateVars = {};

//Our database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: "aa1"},
  "9sm5xK": {longURL: "http://www.google.com", userId: "aa2"}
};

//The tinyApp Users
let users = {
  "aa1" : {
    id: "aa1",
    email: "yaya@gmail.com",
    password: "$2b$10$2uJXf7z0pdTLedx1Dudv4ump/ctwspwqiUmeNKDV/O9IDKzHs2sMm" //Unhashed value: Kal888
  },
  "aa2" : {
    id: "aa2",
    email: "lilcat@yahoo.com",
    password: "$2b$10$0lU03rBdZiRUfhVbx35Bs.g9W9P2qSrd6wQGJrMP2t.02n/6M42o2" //Unhashed value: cat@cat
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

//a new registration
app.get("/register", (req,res) => {
  const user = getUserById(req.session.user_id, users);
  templateVars = {user};
  res.render("register", templateVars);
});

//a new login
app.get("/login", (req,res) => {
  const user = getUserById(req.session.user_id, users);
  templateVars = {user};
  res.render("login", templateVars);
});

//pass the URL data to our template.
app.get("/urls", (req, res) => {
  const user = getUserById(req.session.user_id, users);
  let urls = {};
  if (user) {
    urls = urlsForUser(req.session.user_id, urlDatabase);
    templateVars = {urls, user};
    res.render("urls_index", templateVars);
  } else {
    res.status(402);
    res.render("loginRegister", {urls, user});
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const user = users[userId];
    templateVars = {user};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// A route to update URLs
app.post("/urls/:id/update", (req, res) => {
  if (isURLOwnedByUser(req.params.id, req.session.user_id, urlDatabase)) {
    urlDatabase[req.params.id].longURL = req.body.updatedLongURL;
    res.redirect("/urls");
  } else {
    res.send("User does not have proper permission to update this URL");
  }
});

// A route to delete URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  if (isURLOwnedByUser(req.params.shortURL, req.session.user_id, urlDatabase)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send("User does not have proper permission to delete this URL");
  }
});

app.get("/urls/:shortURL", (req,res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  // Check for an edge case where the URL is not in the system
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.send("The provided URL does not exist in the system");
    // Only display the shortend URL page for the user who owns it
  } else if (isURLOwnedByUser(req.params.shortURL, userId, urlDatabase)) {
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
  // Generate a random 6 char string
  const shortURL = generateRandomString();
  // Save generated shortURL into our DB
  urlDatabase[shortURL] = {longURL:req.body.longURL, userId:req.session.user_id};
  // Redirect the browser to the shortURL
  res.redirect(`/urls/${shortURL}`);
});

/*The Login route - it uses the new email and password fields,
 and sets an appropriate user_id cookie on successful login
*/
app.post("/login", (req,res) => {
  const emailFromUser = req.body.email;
  const currentUser = getUserByEmail(emailFromUser, users);
  //User dosen't exists in our users DB
  if (!currentUser) {
    res.status(403);
    res.send("Email doesn't exists");
  } else if (!(bcrypt.compareSync(req.body.psw, currentUser.password))) {
    res.status(403);
    res.send("Password is incorrect");
  }
  req.session.user_id = currentUser.id;
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/urls");
});

//registering a new user to tinyApp
app.post("/register", (req,res) => {
  let newUser = {};
  const email = req.body.email;
  const password = req.body.psw;
  if (email === "" || password === "" || emailExists(email, users)) {
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
    req.session.user_id = id;
  }
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});