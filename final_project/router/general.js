const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if(username && password){
    if(isValid(username)){
        users.push({"username": username, "password": password});
        return res.status(200).json({message:"User successfully registered. Now you can login."});
    } else {
        return res.status(404).json({message: "User already exists"});
    }
  }
  return res.status(404).json({message: "Unable to register"});

});
   

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Convert books object values to an array
    const bookList = Object.values(books);
    res.status(200).json({ books: bookList });
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author.toLowerCase();
  
    // Filter books where author matches (case-insensitive)
    const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === authorName);
  
    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: `No books found by author: ${req.params.author}` });
    }
  
    res.status(200).json({ books: filteredBooks });
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleName = req.params.title.toLowerCase();
  
    // Filter books where title matches (case-insensitive)
    const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === titleName);
  
    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: `No books found by title: ${req.params.title}` });
    }
  
    res.status(200).json({ books: filteredBooks });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    //Write your code here
      const isbn = req.params.isbn;
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    res.status(200).json({ reviews: book.reviews });
  });


  async function getBooks() {
    try {
      const response = await axios.get('https://deepakmca207-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
      console.log('Books:', response.data.books);
    } catch (error) {
      console.error(error);
    }
  }
  
  getBooks();

  async function getBookByISBN(isbn) {
    try {
      const response = await axios.get(`https://deepakmca207-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/isbn/${isbn}`);
      console.log('Book details:', response.data);
    } catch (error) {
      console.error(error);
    }
  }
  
  getBookByISBN('12345');

  async function getBooksByAuthor(author) {
    try {
      const response = await axios.get(`https://deepakmca207-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${author}`);
      console.log('Books by author:', response.data.books);
    } catch (error) {
      console.error(error);
    }
  }
  
  getBooksByAuthor('Author Name');

  async function getBooksByTitle(title) {
    try {
      const response = await axios.get(`https://deepakmca207-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/title/${title}`);
      console.log('Books by title:', response.data.books);
    } catch (error) {
      console.error(error);
    }
  }
  
  getBooksByTitle('Book Title');



module.exports.general = public_users;
