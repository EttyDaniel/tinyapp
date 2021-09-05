//gets the email from the user and returns the user object if found
const getUserByEmail = function(emailFromUser, users) {
  for (let id in users) {
    if(users[id].email === emailFromUser) {
      return users[id];
    }
  }
  //email was not found
  return "";
};

// Generate a random number, convert it to a string using
// a radix of 36 (which will include all alph-numericals)
// then cut a 6 char substring.
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

//gets the user ID and returns a list of all of the URLs associated with it
const urlsForUser = function (id, urlDatabase) {
  const urls = {};
  for (shortURL in urlDatabase ) {
    if (urlDatabase[shortURL].userId === id) {
      const long = urlDatabase[shortURL].longURL;
      urls[shortURL] =  {longURL: long, userId: id};
    }
  }
  return urls;
};

// Checks if the email exists in the system and returns a boolean response
const emailExists = function(emailFromUser, users) {
  for (let id in users) {
    if(users[id].email === emailFromUser) {
      return true;
    }
  }
  return false;
};

// Check if the URL is owned by the user and returns a boolean response
const isURLOwnedByUser = function(url, userId, urlDatabase) {
  return urlDatabase[url].userId === userId;
};

// Return the user object based on the user ID
const getUserById = function (id, users) {
  return users[id];
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser, emailExists, isURLOwnedByUser, getUserById};