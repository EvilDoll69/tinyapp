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
app.get('/login', (req, res) => {
  res.render(`/login`);
});

app.post('/login', function (req, res) {
  res.cookie("username", req.body.username);  //takes the input from the form
  res.redirect("/urls");
});

//logout username

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

//register username

const users = { 
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
  //video tutorial-----------
  const email = req.body.email;
  const password = req.body.password;

  //------------------
  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  }
  users[userID] = newUser;
  console.log("/register, users", users);
  res.cookie("username", newUser.email);
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



// app.get('/urls', (request, response) => {
//   const templateVars = {
//     urls: urlDatabase,
//     username: request.cookies.username,
//   };
//   response.render('urls_index', templateVars);
// });




 
  
 

