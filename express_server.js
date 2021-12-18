const {getUserByEmail, generateRandomString, authenticateUser,urlsForUser} = require('./helpers');
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

const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);




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
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$TYkQxQTUsyc/XFS20X3zye/IbiMtk1jRtSTXSAU0h1vJeRwfcWKr."
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
}; 



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
  const user = usersDB[user_id];
  const urls = {};

  for (let url in urlDatabase) {
    ///adding urls to the new urls / belongs to the user
    if (user_id === urlDatabase[url].userID) {
      urls[url] = urlDatabase[url].longURL;
    }
  }
  const templateVars = { urls: urls, user: user };
  res.render("urls_index", templateVars);
});

//Redirect a user to log in if it tries to access create link
app.get("/urls/new", (req, res) => {
  const user_id = req.session["user_id"];
  if (!user_id) {
    res.redirect("/login");
  }
  const user = usersDB[user_id];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

//When a user tries to access an invalid link
app.get("/urls/:shortURL", (req, res) => { 
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
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// *************************************POST ENDPOINTS*******************************************


//Validating users to edit links
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);

  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect("/urls");
  } else {
    res.status(401).send("You're not allowed to access this shortURL.");
  }
});

//Handles Post to /login for a user
app.post('/login', function(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(403).send("Email and Password Cannot be Blank!");
  }

  const user = authenticateUser(email, password, usersDB);
  if (user) {
    req.session["user_id"] = user.id;
    res.redirect("/urls");
    } else {
      res.status(401).send("Your credentials doesn't match");
    }
});
// Clears cookie
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls');
});

//handles post request for create/modifying
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(404).send("You need to login to create/modify a TinyURL\n");
  }
  const userID = req.session["user_id"];
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: userID };
  res.redirect(`/urls/${shortURL}`); 
});



//Handles delete post
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  //Only authorized users can delete / edit
  if (shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  }
  res.send("You're not authorized to do that");
});
   

//receive the info from the register form
app.post('/register', (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, salt);


  if (!email || !password) {
    return res.status(400).send("Missing email or password");
  }
  
  const user = getUserByEmail(email, usersDB);
  if(user) {
    return res.status(400).send("A user with that email already exists");
  }

  usersDB[user_id] = {
    id: user_id,
    email: email,
    password: password,
  };

  req.session["user_id"] = user_id;
  res.redirect("/urls");

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


 


 
  
 

