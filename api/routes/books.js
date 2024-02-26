const express = require("express");
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const BooksController = require('../controllers/books');

router.get("/", BooksController.books_get_all);

router.get("/:bookId", BooksController.books_get_book);
router.post("/",checkAuth, BooksController.books_create_book);

router.patch("/:bookId", checkAuth, BooksController.books_update_book);

router.delete("/:bookId", checkAuth, BooksController.books_delete);

module.exports = router;
