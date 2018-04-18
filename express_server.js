const alphanum = "abcdefghijkmnopqrstuvwxyz1234567890";

function generateRandomString() {
  let result = "";
  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * alphanum.length);
    //music library instead of for loop
    //generates a uniqueID
    //fuction generateRandomString() {
    //return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    //}
    result += alphanum[index];
  }

  return result;
}

console.log(generateRandomString());

var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//pug is another way of creatin ejs -- signaling that our html will be using ejs inside and the modulo brackets signfy JS
app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//wherever you see app.get, these are called routes -- you have an interaction between your browser and your server: browser says get me the index page --if you ask for a diff page, you're asking for /urls/show/html -- server needs to know what to do
//the server will decode the URL pattern - it will try to match it with a route located in your server
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// any get route has a req response it renders an ejs file - it does not have access to anything in terms of variables - ejs files only have access to variables in the route that's rendering it
//any form in ejs file, if it had a form in ejs file, it should be the get method to this
//localhost:3000/urls/ pattern is recognized! how the browser knows what to do
//when it finds the match - itll execute the index.ejs - itll read the content of html but execute the JS in there and it will output a final HTML -- index.html
//then itll send index back to the browser to be displayed - and then it waits for another request

app.get("/urls", (req, res) => {
  //inside this function urldatabase is visible -- index.ejs is invisible the only way to make data visible is to use the templateVars
  //templateVars transmits data to url index
  let templateVars = { urls: urlDatabase };
  //the value of urlDatabase links to the var -- now url index can access its value
  console.log(templateVars);
  //render means execute the page, the JS and create the final html with it
  res.render("urls_index", templateVars);
});

/**************************************************/
app.post("/urls", (req, res) => {

  const generatedUrl = generateRandomString();
  const longUrl = req.body.longURL;
  //req.body gives you the data you receive by post
  //parameter, whatever you receive by the form -- in the input of urls_new
  urlDatabase[generatedUrl] = longUrl;
  //console.log(req.body);  // debug statement to see POST parameters
  res.redirect("/urls/" + generatedUrl);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params);
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] || "not found" };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//post routes don't render anything
app.post("/urls/:id/delete", (req, res) => {
  delete (urlDatabase[req.params.id])
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  console.log("req.body", req.body);
  //everything you send in a form is sent thru req.body
  //the shortURL comes from req.params.id -- comes from the URL -- substiute for :id
  const newLongUrl = req.body.longUrl;
  const shortURL = req.params.id;
  //console.log("req.params", req.params);
  urlDatabase[shortURL] = newLongUrl; //trying to change longUrl value of a specific key
});

/*************************************************/
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//when you display a page its always a get
