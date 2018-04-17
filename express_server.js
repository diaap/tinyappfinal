var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] || "not found" };

  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

/*
The above code should render a "Hello World" using HTML at http://localhost:8080/hello.
See what you get back on the command line.
Inspect with curl -i http://localhost:8080/hello
What do you (should you) see?
A full webpage is typically more complicated – it has variables that change, the HTML code is often very long. We need to structure our approach. */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});