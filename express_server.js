const {getUserByEmail, generateRandomString} = require('./helpers');
const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["Key1", "Key2"],
}));

app.set("view engine", "ejs");

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
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}; 

const urlsForUser = (id) => {
  console.log("Hello!", id);
  const URLs = {};
  for (let url in urlDatabase) {      //userID is equal to the id of the currently logged-in user
    const value = urlDatabase[url];  //value = object
    
    if (value.userID === id) {
      console.log(value);
      URLs[url] = value;
    }
  }
  console.log(URLs);
  return URLs;
};

app.get("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("Log In or Register to visit a page!");
  }
  const templateVars = {
    urls: urlsForUser(req.session["user_id"]),
    username: usersDB[req.session["user_id"]]  //entire user's object
  };
  console.log(templateVars);
  return res.render("urls_index", templateVars);
});

app.post("/urls/:id", (req, res) => {         // updeted URL on the main page
  if (!req.session["user_id"]) {
    return res.send("Log In or Register to visit a page!");
  }
  const shortURL = req.params.id;
  const newLongURL = req.body.newURL;
  const newURL = urlDatabase[shortURL];
  if (newURL.userID === req.session["user_id"]) {
    urlDatabase[shortURL].longURL = newLongURL;
  } else {
    return res.send("URL does not belong to you!");
  }
  return res.redirect("/urls");
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

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: usersDB[req.session["user_id"]]  //entire user's object
  };
  if (!req.session["user_id"]) {
    res.redirect('/login');
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: usersDB[req.session["user_id"]] };
  res.render("urls_show", templateVars);
});
//-------------------EDITING URL-------------------//
app.get("/u/:shortURL", (req, res) => {       //redirect though the short URL
  for (let shortURL in urlDatabase) {         //checking if URL exist in the database
    if (shortURL === req.params.shortURL) {
      const longURL = urlDatabase[shortURL].longURL;
      return res.redirect(longURL);
    } else {
      return res.status(404).send("Page does not exist!");   //redirect to actual page
    }
  }
});
//--------------------DELITING PAGE---------------------//
app.post("/urls/:shortURL/delete", (req, res) => {  //creating a variable
  if (!req.session["user_id"]) {
    return res.send("Log In or Register to visit a page!");
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
app.get('/login', (req, res) => {             //gives an empty page
  const templateVars = {
    urls: urlDatabase,
    username: usersDB[req.session["user_id"]]  //entire user's object
  };
  if (templateVars.username) {
    res.redirect('/urls');
    return;
  }
  res.render(`urls_login`, templateVars);
});

app.post('/login', function(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if (email.length === 0  || password.length === 0) {
    res.status(400).send("400 ERROR");
    return;
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

//----------------REGISTER NEW USER-----------------//
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: usersDB[req.session["user_id"]]  //entire user's object
  };
  if (templateVars.username) {
    res.redirect('/urls');
    return;
  }
  
  res.render('urls_register',templateVars);
});
//receive the info from the register form
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email.length === 0  || password.length === 0) {
    res.status(400).send("400 ERROR");
    return;
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);

  for (let userID in usersDB) {
    const user = usersDB[userID];           //retreive the value through the key
  
    if (user.email === email) {
      res.status(403).send("Sorry, User already exists!");
      return; //we do not need ELSE because if this statement is never triggered, all will move on without this part
    }
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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b><body><html>\n");
});

 


 
  
 

