const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require(`cookie-parser`);
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString (length = 6 ) {
  return (Math.random().toString(36).substr(2, length));
  };

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

const getUserByEmail = (usersDB, email) => {

  for (let user in usersDB) {
    const userIdObject = usersDB[user]; //retreive the value through the key
    if (userIdObject.email === email) {
      return userIdObject; //object
    }
  }
  return null;
};

const urlsForUser = (id) => {
  console.log("Hello!", id);
  const URLs = {};
  for (let url in urlDatabase) { //userID is equal to the id of the currently logged-in user
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
  if(!req.cookies["user_id"]) {
    return res.send("Log In or Register to visit a page!");
  }
  const templateVars = { 
    urls: urlsForUser(req.cookies["user_id"]),
    username: usersDB[req.cookies["user_id"]]  //entire user's object    
  };  
  console.log(templateVars);
      return res.render("urls_index", templateVars);    
});

app.post("/urls/:id", (req, res) => {// updeted URL on the main page
  if(!req.cookies["user_id"]) {
    return res.send("Log In or Register to visit a page!");
  };
    const shortURL = req.params.id;
    const newLongURL = req.body.newURL;
    const newURL = urlDatabase[shortURL];
   if(newURL.userID === req.cookies["user_id"]) {
    urlDatabase[shortURL].longURL = newLongURL;
   } else {
     return res.send("URL does not belong to you!")
   }   
      return res.redirect("/urls"); 
  });

app.post("/urls", (req, res) => {  
  let newShortURL = generateRandomString();
  const longURL = req.body.longURL;
  // urlDatabase[newShortURL] = longURL; //add to the page
  urlDatabase[newShortURL] = {
    longURL: longURL,
    userID: req.cookies["user_id"] // if the user new, we do not need all database(line 86)
  }
  console.log(urlDatabase);
  res.redirect(`/urls`); 
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: usersDB[req.cookies["user_id"]]  //entire user's object    
  };
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    username: usersDB[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => { //redirect though the short URL
  
  // const shortURL = req.params.shortURL;
  for (let shortURL in urlDatabase) {       //checking if URL exist in the database
    if(shortURL === req.params.shortURL) {
      const longURL = urlDatabase[shortURL].longURL;
      return res.redirect(longURL);  
    } else {
      return res.status(404).send("Page does not exist!");   //redirect to actual page
    } 
  }                  
});

app.post("/urls/:shortURL/delete", (req, res) => {  //creating a variable
  if(!req.cookies["user_id"]) {
    return res.send("Log In or Register to visit a page!");
  };

  const shortURL = req.params.shortURL; 
  const newLongURL = req.body.newURL;
    const newURL = urlDatabase[shortURL];
   if(newURL.userID === req.cookies["user_id"]) {
    delete urlDatabase[shortURL];;
   } else {
     return res.send("URL does not belong to you!")
   }   
      return res.redirect("/urls"); 
  });
   

//login username
app.get('/login', (req, res) => { //gives an empty page   
  const templateVars = { 
    urls: urlDatabase,
    username: usersDB[req.cookies["user_id"]]  //entire user's object
  };  
  if (templateVars.username) {
    res.redirect('/urls');
    return;
  } 
  res.render(`urls_login`, templateVars);
});

app.post('/login', function (req, res) {  
  const email = req.body.email;
  const password = req.body.password; 

  if (email.length === 0  || password.length === 0) {
    res.status(400).send("400 ERROR");
    return;
  };

  const user = getUserByEmail(usersDB, email);
  if (user) {
    if (user.password === password) {
      res.cookie("user_id", user.id);
      res.redirect('/urls');
      return;
    } else {
      res.status(401).send("Incorrect password")
    }    
  } else {
    res.status(401).send("Email not found");
  }

  //looking up th existing user
  //set the cookies => keep the user ID in the cookie
  //asking the browser to keep that info   
  
});
//logout username
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//register username


app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: usersDB[req.cookies["user_id"]]  //entire user's object    
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

  for (let userID in usersDB) {
    const user = usersDB[userID]; //retreive the value through the key
  
    if (user.email === email) {
      res.status(403).send("Sorry, User already exists!");
      return; //we do not need ELSE because is this statement is never trigured, all will move on without this part
    }
  }

  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email,
    password
  };
  //add user to the Database
  usersDB[userID] = newUser;
  console.log("/register, users", usersDB);
  //set the cookies => keep the user ID in the cookie
  //asking the browser to keep that info 
  
  res.cookie("user_id", userID);
  res.redirect('/urls');
});


app.get("/", (req, res) => {
  res.send("Hello!")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b><body><html>\n")
});

 


 
  
 

