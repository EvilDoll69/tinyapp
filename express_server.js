const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

function generateRandomString (length = 6 ) {
  return (Math.random().toString(36).substr(2, length));
  };

app.post("/urls", (req, res) => {  
  let newShortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[newShortURL] = longURL; //add to the page
  console.log(req.body);
  // console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${newShortURL}`); 

});

// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });





app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]; //shortURL is a varioable
  res.redirect(longURL); //redirect to actual page
});

app.post("/urls/:shortURL/delete", (req, res) => {  //creating a variable
  // 
  const shortURL = req.params.shortURL;   
  console.log(typeof(shortURL));
  delete urlDatabase[shortURL];
  res.redirect("/urls");  
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




 
  
 

