const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  secret: 'COOKIE_SESSION_SECRET'
}));

const bcryptjs = require('bcryptjs');
const password = "purple"; // you will probably this from req.params
const hashedPassword = bcryptjs.hashSync(password, 10);

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcryptjs.hashSync('password', 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcryptjs.hashSync('password', 10)
  }
}

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", linkid: 'userRandomID'},
  '9sm5xK': { longURL: "http://www.google.com", linkid: 'userRandomID'}
};

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

// Registration email exists checker
const regChecker = (email, password) => {
  if (password === undefined) {
    for (randId in users) {
      if (users[randId].email === email){
        return true;
      }
    } return false;
  }
};

// This checks if the current userid (from the cookie) matches with the database
const userChecker = (currentUser) => {
  for (let user in users) {
    if (user === currentUser) {
      return true;
    }
  } return false;
};


app.get("/", (req, res) => {
  let templateVars = { url: urlDatabase, username: users[req.session.user_id]};
  if (userChecker(req.session.user_id)) {
    res.render('urls_index', templateVars);
  } else {
    res.render('index', templateVars);
  }
});


app.get('/login', (req, res) => {
  res.redirect('/');
});


app.get('/urls', (req, res) => {
  if (userChecker(req.session.user_id)) {
    let subset = {};
    for (let link in urlDatabase){
      if (urlDatabase[link].linkid === req.session.user_id){
        subset[link] = urlDatabase[link];
      }
    }
    let templateVars = {
      url: subset,
      username: users[req.session.user_id]
    };
    res.render('urls_index', templateVars);
  } else {
    res.status(401);
    res.send('Error: 401');
  }
});

// New Link Page
app.get('/urls/new', (req, res) => {
  if (userChecker(req.session.user_id)) {
    let subset = {};
    for (let link in urlDatabase){
      if (urlDatabase[link].linkid === req.session.user_id){
        subset[link] = urlDatabase[link];
      }
    }
    let templateVars = {
      url: subset,
      username: users[req.session.user_id]
    };
    res.render('urls_new', templateVars);
  } else {
    res.status(401);
    res.send('Error: 401');
  }
});

app.get('/urls/:id', (req, res) => {
  if (!(urlDatabase[req.params.id])) {
    res.status(404);
    res.send('Error: 404');
    return;
  } if (!req.session.user_id) {
    res.status(401);
    res.send('Error: 401');
    return;
  } if (urlDatabase[req.params.id].linkid !== req.session.user_id) {
    res.status(403)
    res.send('Error: 403');
    return;
  } if (userChecker(req.session.user_id)) {

    let templateVars = {
      url: req.params.id,
      long: urlDatabase[req.params.id].longURL
    };
    res.render('urls_show', templateVars);
    return;
  }

});

app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]) {
    res.status(404);
    res.send('Error: 404');
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});


app.get('/register', (req, res) => {
  if (userChecker(req.session.user_id)){
    res.redirect('/');
  } res.render('register');
});


app.post("/urls/:id/delete", (req, res) => {
  if (userChecker(req.session.user_id)) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.status(403);
    res.send('403: You are not allowed to delete this');
  }
});

app.post("/urls", (req, res) => {
  if (userChecker(req.session.user_id)) {
    let newID = generateRandomString();
    urlDatabase[newID] = {
      longURL: req.body.longURL,
      linkid: req.session.user_id
    };
    res.redirect('/urls');
  } else {
    res.status(401);
    res.send('Error: 401');
  }
});

app.post("/urls/:id", (req, res) => {
  if (!(urlDatabase[req.params.id])) {
    res.status(404);
    res.send('Error: 404');
    return;
  } if (!req.session.user_id) {
    res.status(401);
    res.send('Error: 401');
    return;
  } if (urlDatabase[req.params.id].linkid !== req.session.user_id) {
    res.status(403)
    res.send('Error: 403');
    return;
  } if (userChecker(req.session.user_id)) {
    urlDatabase[req.params.id] = {
      longURL: req.body.newURL,
      linkid: req.session.user_id
    };
    res.redirect('/urls');
  }
});


app.post("/login", (req, res) => {
  // email-password checker
  for (user in users) {
    if (users[user].email === req.body.email && bcryptjs.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = users[user].id;
      res.redirect('/urls');
      return;
    }
  }
  res.status(401);
  res.send('Username and password does not match.');
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/');
});


app.post('/register', (req, res) => {
  // checks if email or password is empty
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Email or password empty.')

  } else if (regChecker(req.body.email)) {
    res.status(400);
    res.send('Email already logged in database.');

  } else {
    // add a new user to dabatase
    let newUserId = generateRandomString();
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: bcryptjs.hashSync(req.body.password, 10)
    };
    req.session.user_id = newUserId;
    res.redirect('/urls');
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});