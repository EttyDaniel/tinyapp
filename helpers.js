//gets the email from the user in returns user object if found
const getUserByEmail = function(emailFromUser, users) {
  for (let id in users) {
    if(users[id].email === emailFromUser) {
      return users[id];
    }
  }
  //email was not found
  return "";
};

const generateRandomString = function() {
  // Generate a random number, convert it to a string using
  // a radix of 36 (which will include all alph-numericals)
  // then cut a 6 char substring.
  return Math.random().toString(36).substr(2, 6)
};

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

const emailExists = function(emailFromUser, users) {
  for (let id in users) {
    if(users[id].email === emailFromUser) {
      return true;
    }
  }
  return false;
};

const isURLOwnedByUser = function(url, userId, urlDatabase) {
  return urlDatabase[url].userId === userId;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser, emailExists, isURLOwnedByUser};