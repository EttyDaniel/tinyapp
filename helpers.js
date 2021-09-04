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

module.exports = {getUserByEmail};