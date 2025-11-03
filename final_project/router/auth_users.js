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
    }, 'SECRET_KEY', {expiresIn: '1h' });

    // save token in session 
    req.session.authorization = {
        accessToken: accessToken
    };

    return res.status(200).json({message: "Login successfully.", accessToken});
  }
});
 
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;  // Assuming req.user is set after JWT auth middleware
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully.", reviews: book.reviews });
    } else {
      return res.status(404).json({ message: "Review not found for this user." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
