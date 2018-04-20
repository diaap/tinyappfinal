/* here is my users database */
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
/* here is my checkLogin function it checks if useremail (server) is equal to useremail (database) */
function checkLogin (useremail, password) {
  for (let userId in users) {
    if (useremail === users[userId].email &&
      password === users[userId].password) {
        return users[userId];
    }
  }
  return false;
}

/* here is my random generate string */

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

/* I like to see this console log logged in my terminal so i keep it here*/
console.log(generateRandomString());

/* I'm setting up my application*/

var express = require("express");
var cookieParser = require('cookie-parser')

// this makes my cookies
var app = express();
app.use(cookieParser())

var PORT = process.env.PORT || 8080; // default port 8080

// this is used to parse post requests from forms
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

//this is my URL database
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//wherever you see app.get, these are called routes -- you have an interaction between your browser and your server: browser says get me the index page --if you ask for a diff page, you're asking for /urls/show/html -- server needs to know what to do
//the server will decode the URL pattern - it will try to match it with a route located in your server

//this is my index page that I don't use

app.get("/", (req, res) => {
  res.send("Hello!");
});

// this will give me my database in JSON

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// this is my register
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.userId]
    };
  res.render("register", templateVars);
});






app.post("/register", (req, res) => { //post is whenever you submit the form
  //add a new user
  let randomId = generateRandomString();

  users[randomId] = {
    id: randomId,
    email: req.body.email,
    password: req.body.password,
  };

  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("please enter an e-mail and password");
  }

  res.cookie('user_id', users[randomId].id);
  res.redirect('/urls');
  console.log(users);
});








app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.userId]
    };
  res.render('login', templateVars);
});




// any get route has a req response it renders an ejs file - it does not have access to anything in terms of variables - ejs files only have access to variables in the route that's rendering it
//any form in ejs file, if it had a form in ejs file, it should be the get method to this
//localhost:3000/urls/ pattern is recognized! how the browser knows what to do
//when it finds the match - itll execute the index.ejs - itll read the content of html but execute the JS in there and it will output a final HTML -- index.html
//then itll send index back to the browser to be displayed - and then it waits for another request

app.get("/urls", (req, res) => {
  //inside this function urldatabase is visible -- index.ejs is invisible the only way to make data visible is to use the templateVars
  //templateVars transmits data to url index
  let userId = res.cookie['user_id'];
  //console.log(userId);
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
    };

  //the value of urlDatabase links to the var -- now url index can access its value
  //console.log(templateVars);
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
  let userId = res.cookie('user_id');
  let templateVars = { user: users[req.cookies.userId] };
  res.render("urls_new", templateVars);
});








app.get("/urls/:id", (req, res) => {
  console.log(req.params);
  //let userId = res.cookie('user_id');
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] || "not found",
                       user: req.cookies[req.cookies.userId]};
  res.render("urls_show", templateVars);
});








app.get("/u/:shortURL", (req, res) => {
  let templateVars = { user: req.cookies[req.cookies.userId]}
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
  const newLongUrl = req.body.longURL;
  const shortURL = req.params.id;
  //console.log("req.params", req.params);
  urlDatabase[shortURL] = newLongUrl; //trying to change longUrl value of a specific key
  res.redirect("/urls");
});






app.post("/login", (req, res) => {
  var loginEmail = req.body.email;
  var loginPassword = req.body.password;
  const userLogin = checkLogin(loginEmail, loginPassword);


  if (userLogin) {
    res.cookie('user_id', userLogin.id);
    res.redirect('/urls/');
  } else {
    res.status(403);
    res.send("you have the wrong credentials");
  }

  // app.post("/login", (req, res) => {
//   const user = checkLogin(req.body.email, req.body.password);

// });

  console.log("userLogin", userLogin);

});

//this deletes my userID cookies

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

