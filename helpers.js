//Encryption
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10)

const getUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId]; //retreive the value through the key
    if (user.email === email) {
      return user;       //object
    }
  }
  return null;
};

const authenticateUser = (email, password, database) => {
  //Retrieve the user with that email
  const user = getUserByEmail(email, database);
  //if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    //user is authenticated
    return user;
  } else {
    //otherwise return false
    return false;
  }
};

const generateRandomString = (length = 6) => {
  return (Math.random().toString(36).substr(2, length));
};

   

  

module.exports = {
  getUserByEmail,
  generateRandomString,
  authenticateUser
};
   