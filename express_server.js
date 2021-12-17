const {getUserByEmail, generateRandomString} = require('./helpers');
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; //default port 8080
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  secret: "8f20be78-5940-11ec-bf63-0242ac130002"}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");



const bcrypt = require('bcryptjs');




const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
};

const usersDB = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$TYkQxQTUsyc/XFS20X3zye/IbiMtk1jRtSTXSAU0h1vJeRwfcWKr."
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}; 

// const urlsForUser = (id) => {
//   console.log("Hello!", id);
//   const URLs = {};
//   for (let url in urlDatabase) {      //userID is equal to the id of the currently logged-in user
//     const value = urlDatabase[url];  //value = object
    
//     if (value.userID === id) {
//       console.log(value);
//       URLs[url] = value;
//     }
//   }
//   console.log(URLs);
//   return URLs;
// };

//testing purposes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Redirect a user to register if not a valid user
app.get("/", (req, res) => {
  res.redirect("/register");
});

//Handles Login request
app.get('/login', (req, res) => {          
  const templateVars = {
    user: usersDB[req.session["user_id"]],
  };
  res.render(`login`, templateVars);
});

// Handles route for register
app.get("/register", (req, res) => {
  res.render("register");
});

//Only show links to users that creates them
app.get("/urls", (req, res) => {
  const user_id = req.session["user_id"];
  const user = usersDB[user_id]
  const urls = {};

  for(let url in urlDatabase) {
    if(user_id === urlDatabase[url].userID) {
      urls[url] = urlDatabase[url].longURL;
    }
  }
  const templateVars = {urls: urls, user: user};
  res.render("urls_index", templateVars);
});


//Redirect a user to log in if it tries to access create link
app.get("/urls/new", (req, res) => {
  const user_id = req.session["user_id"];
  if (!user_id) {
    res.redirect('/login');
  }
  const user = usersDB[user_id];
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});

//When a user tries to access an invalid link
app.get("/u/:shortURL", (req, res) => { 
  const user_id = req.session["user_id"];
  const user = usersDB[user_id];

  const { longURL } = urlDatabase[req.params.shortURL] || {};
  if(!longURL) {
    return res.status(404).send(`<h1 text-align: center; >STOP! TRYING TO access an invalid LINK!!!</h1>`)
  }
  
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL,
    user: user,
  };
  res.render("urls_show", templateVars);
});

//Creating Long URLS
app.get("/urls/:shortURL", (req, res) => {
const longURL = urlDatabase[req.params.shortURL].longURL;
res.redirect(longURL);
});


// *************************************POST ENDPOINTS*******************************************

//Handles editing post request
app.post("/urls/:shortURL", (req, res) => {        

  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.updatedURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[newShortURL] = {
    longURL: longURL,
    userID: req.session["user_id"]    //if the user is new, we do not need all database
  };
  console.log(urlDatabase);
  res.redirect(`/urls`);
});


//--------------------DELITING PAGE---------------------//
app.post("/urls/:shortURL/delete", (req, res) => {  //creating a variable
  if (!req.session["user_id"]) {
    return res.send("<a href='/login'>Log In</a> or <a href ='/register'>Register</a> to visit a page!");
  }

  const shortURL = req.params.shortURL;
  const newURL = urlDatabase[shortURL];
  if (newURL.userID === req.session["user_id"]) {
    delete urlDatabase[shortURL];
  } else {
    return res.send("URL does not belong to you!");
  }
  return res.redirect("/urls");
});
   

//--------------------------LOGIN------------------------//

app.post('/login', function(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(403).send("Email and Password Cannot be Blank!");
  }

  const user = getUserByEmail(usersDB, email);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
      return;
    } else {
      res.status(401).send("Incorrect password");
    }
  } else {
    res.status(401).send("Email not found");
  }

});
//--------------------LOGOUT--------------------//
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//receive the info from the register form
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Missing email or password. Please <a href='/register'>try again</a>");
    return;
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);

  // for (let userID in usersDB) {
  //   const user = usersDB[userID];           //retreive the value through the key
  
    if (getUserByEmail(usersDB, email)) {
      res.status(403).send("Sorry, User already exists! Please <a href='/login'>try to register!</a>");
      return; //we do not need ELSE because if this statement is never triggered, all will move on without this part
    }

  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email,
    password: hashedPassword
  };
  //add user to the Database
  usersDB[userID] = newUser;
  //set the cookies => keep the user ID in the cookie
  //asking the browser to keep that info
 
  req.session.user_id = newUser.id;
  res.redirect('/urls');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


 


 
  
 

