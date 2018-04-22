const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  secret: 'COOKIE_SESSION_SECRET'
}));

const bcryptjs = require('bcryptjs');
const password = "purple";
const hashedPassword = bcryptjs.hashSync(password, 10);

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "avocado"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "pineapple"
  }
}

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", linkid: 'userRandomID' },
  '9sm5xK': { longURL: "http://www.google.com", linkid: 'userRandomID' }
};

const alphanum = "abcdefghijkmnopqrstuvwxyz1234567890";

function generateRandomString() {
  let result = "";
  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * alphanum.length);
    result += alphanum[index];
  }
  return result;
}

// This function expression checks if the currentUserid (from the cookie) matches with the userid from the database
const userChecker = (currentUser) => {
  for (let user in users) {
    if (user === currentUser) {
      return true;
    }
  } return false;
};


app.get("/urls", (req, res) => {
  let templateVars = { url: urlDatabase, username: users[req.session.user_id] };
  if (userChecker(req.session.user_id)) {
    res.render('urls_index', templateVars);
  } else {
    res.render('index', templateVars);
  }
});


app.get('/login', (req, res) => {
  let templateVars = {
    username: users[req.session.user_id],
    users: users
  };
  res.render('login', templateVars);
});


app.get('/urls', (req, res) => {
  if (userChecker(req.session.user_id)) {
    let subset = {};
    for (let link in urlDatabase) {
      if (urlDatabase[link].linkid === req.session.user_id) {
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

// Get new links
app.get('/urls/new', (req, res) => {
  if (userChecker(req.session.user_id)) {
    let subset = {};
    for (let link in urlDatabase) {
      if (urlDatabase[link].linkid === req.session.user_id) {
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
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404);
    res.send('Error: 404');
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});


app.get('/register', (req, res) => {
  let templateVars = { url: urlDatabase, username: users[req.session.user_id] };
  res.render('register', templateVars);
  res.redirect('/urls');
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
  // check if the e-mail and passwords match and user emails match
  let verifiedId = "";
  for (let user in users) {
    let userPassword = bcryptjs.compareSync(req.body.password, users[user].password);
    if (users[user].email === req.body.email) {
      verifiedId = users[user].id;
    }
  }
    if (verifiedId === "") {
      // console.log(user);
      res.status(401);
      res.send('Invalid input.');
      return;
  } else {
  req.session.user_id = verifiedId;
  res.redirect('/urls');
  }
});


app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});


app.post('/register', (req, res) => {
  // check if email or password is empty
  //console.log(req.body.email); === test
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Email or password empty.')
    return;
  }
  //now we're checking all the users we have -- does any of them match req.body.email
  for (user in users) {
    if (users[user].email === req.body.email) {
      //console.log ("match", req.body.email);
      res.send("Email already in use.")
    }
  }

  if (req.body.email === undefined || req.body.email === "") {
    console.log("empty");


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