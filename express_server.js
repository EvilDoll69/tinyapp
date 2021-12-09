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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]    
  };
  res.render("urls_index", templateVars);
});

app.post("/urls/:id", (req, res) => {// changing the URL
   const shortURL = req.params.id;
   const newLongURL = req.body.newURL;
   urlDatabase[shortURL] = newLongURL;
   res.redirect("/urls");
  });

app.post("/urls", (req, res) => {  
  let newShortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[newShortURL] = longURL; //add to the page
  res.redirect(`/urls/${newShortURL}`); 
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]    
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]; //shortURL is a varioable
  res.redirect(longURL);                  //redirect to actual page
});

app.post("/urls/:shortURL/delete", (req, res) => {  //creating a variable
  const shortURL = req.params.shortURL;   
  delete urlDatabase[shortURL];
  res.redirect("/urls");  
});


//login username
app.get('/login', (req, res) => { //gives an empty page   
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]    
  };  
  res.render(`urls_login`, templateVars);
});

app.post('/login', function (req, res) {  
  const email = req.body.email;
  const password = req.body.password; 

  if (email.length === 0  || password.length === 0) {
    res.status(400).send("400 ERROR");
    return;
  }

  for (let userID in usersDB) {
    const user = usersDB[userID]; //retreive the value through the key
  
    if (user.email === email && user.password === password) {
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
  
  res.cookie("username", newUser.email);
  res.redirect('/urls');
  res.cookie("username", req.body.email); //take the input from the form
  res.redirect('/urls');
});

//logout username
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

//register username
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
}

app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]    
  };
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
  
  res.cookie("username", newUser.email);
  res.redirect('/urls');
});


app.post('/login', (req, res) => {
  res.redirect('/login');
})


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

 


 
  
 

