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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

//pass the URL data to our template.
app.get("/urls", (req, res) => {
  const username = req.cookies['user'];
  const templateVars = {urls: urlDatabase, username};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies['user'];
  const templateVars = {username};
  res.render("urls_new", templateVars);
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedLongURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req,res) => {
  const username = req.cookies['user'];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req,res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console

  // Generate a random 6 char string
  const shortURL = generateRandomString();

  // Save generated shortURL into our DB
  urlDatabase[shortURL] = req.body.longURL;

  // Redirect the browser to the shortURL
  res.redirect(`/urls/${shortURL}`);
});

/*The Login route - It should set a cookie named username 
to the value submitted in the request body via the login form
and then redirect back to /urls page
*/
app.post("/login", (req,res) => {
  const username = req.body.username;
  res.cookie("user", username);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  //console.log(req.body.username);
  res.clearCookie("user");
  res.redirect("/urls");
});

function generateRandomString() {
  // Generate a random number, convert it to a string using
  // a radix of 36 (which will include all alph-numericals)
  // then cut a 6 char substring.
  return Math.random().toString(36).substr(2, 6)
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});