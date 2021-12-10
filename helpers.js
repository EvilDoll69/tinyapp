const getUserByEmail = (usersDB, email) => {

  for (let user in usersDB) {
    const userIdObject = usersDB[user]; //retreive the value through the key
    if (userIdObject.email === email) {
      return userIdObject; //object
    }
  }
  return null;
};

const generateRandomString = (length = 6) => {
  return (Math.random().toString(36).substr(2, length));
};

   

  

module.exports = {
  getUserByEmail,
  generateRandomString
};
   