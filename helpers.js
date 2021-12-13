const getUserByEmail = (usersDB, email) => {
  for (const key in usersDB) {
    const userIdObject = usersDB[key]; //retreive the value through the key
    if (userIdObject.email === email) {
      console.log("HELLO!");
      return userIdObject;          //object
    }
  }
  // return null;
};

const generateRandomString = (length = 6) => {
  return (Math.random().toString(36).substr(2, length));
};

   

  

module.exports = {
  getUserByEmail,
  generateRandomString
};
   