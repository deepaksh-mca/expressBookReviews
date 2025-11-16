const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// let users = [];
const users = [
  { username: "user1", password: "pass1" },
  { username: "user2", password: "pass2" }
];

const isValid = (username) => {
  // Check if username is non-empty and not already taken
  if (!username) return false;

  // Return true if username does NOT exist in users array (i.e., is valid to register)
  return !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    // Check if there is a user with matching username and password
    return users.some(user => user.username === username && user.password === password);
  };
  

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message: "error in looged in"});
  }

  if(authenticatedUser(username, password)){
    let accessToken = jwt.sign({
        data: password
    }, "fingerprint_customer", {expiresIn: '1h' });

    // save token in session 
    req.session.authorization = {
        accessToken: accessToken
    };
    req.session.user = { username };

    return res.status(200).json({message: "Login successfully.", accessToken});
  }
});
 
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.user && req.session.user.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  // Initialize reviews object if not present
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update the review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/modified successfully", reviews: books[isbn].reviews });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.user && req.session.user.username;
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review by this user not found" });
    }
  
    // Delete the user's review
    delete books[isbn].reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
