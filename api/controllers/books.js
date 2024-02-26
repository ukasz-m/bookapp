const mongoose = require("mongoose");
const Book = require("../models/book");

function isbnIsValid(isbn) {
    const isbnRegex = /^(?:ISBN(?:-13)?:?\ )?(?=[0-9]{13}$|(?=(?:[0-9]+[-\ ]){4})[-\ 0-9]{17}$)97[89][-\ ]?[0-9]{1,5}[-\ ]?[0-9]+[-\ ]?[0-9]+[-\ ]?[0-9]$/;
    return isbnRegex.test(isbn);
}

exports.books_get_all = (req, res, next) => {
  Book.find()
    .select("name price _id")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/books/" + doc._id
            }
          };
        })
      };
         if (docs.length >= 0) {
      res.status(200).json(response);
         } else {
             res.status(404).json({
                 message: 'No entries found'
             });
         }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.books_create_book = (req, res, next) => {
  Book.find({ isbn: req.body.isbn })
      .exec()
      .then(obj => {
        if (obj.length >= 1) {
          return res.status(409).json({
            message: "ISBN exists"
          });
        }

        if (!isbnIsValid(req.body.isbn)) {
          return res.status(400).json({ error: 'Invalid ISBN format' });
        }

        const book = new Book({
          _id: new mongoose.Types.ObjectId(),
          title: req.body.title,
          price: req.body.price,
          isbn: req.body.isbn,
          author: req.body.author,
          description: req.body.description,
          weight: req.body.weight,
          kind: req.body.kind,
        });

        book
            .save()
            .then(result => {
              console.log(result);
              res.status(201).json({
                message: "Created book successfully",
                createdProduct: {
                  name: result.name,
                  price: result.price,
                  _id: result._id,
                  request: {
                    type: "POST",
                    url: "http://localhost:3000/books/"
                  }
                }
              });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({
                error: err
              });
            });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
};

exports.books_get_book = (req, res, next) => {
  const id = req.params.bookId;
  Book.findById(id)
    .select("name price _id")
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          book: doc
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.books_update_book = (req, res, next) => {
  const id = req.params.bookId;

    Book.find({ isbn: req.body.isbn })
        .exec()
        .then(obj => {
            if (obj.length >= 1) {
                return res.status(409).json({
                    message: "ISBN exists"
                });
            }

    if (req.body.isbn) {
        if (!isbnIsValid(req.body.isbn)) {
            return res.status(400).json({ error: 'Invalid ISBN format' });
        }
    }

  Book.updateOne({ _id: id }, { $set: req.body })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Book updated",
        request: {
          type: "PATCH",
          url: "http://localhost:3000/books/" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
  });
};

exports.books_search = (req, res, next) => {
  const criteria = {};

  if (req.query.isbn) {
    if (!isbnIsValid(req.query.isbn)) {
      return res.status(400).json({ error: 'Invalid ISBN format' });
    }
    criteria.isbn = req.query.isbn;
  }
  if (req.query.title) {
    criteria.title = req.query.title;
  }
  if (req.query.author) {
    criteria.author = req.query.author;
  }
  if (req.query.minPrice || req.query.maxPrice) {
    criteria.price = {};
    if (req.query.minPrice) {
      criteria.price.$gte = req.query.minPrice;
    }
    if (req.query.maxPrice) {
      criteria.price.$lte = req.query.maxPrice;
    }
  }
  if (req.query.kind) {
    criteria.kind = req.query.kind;
  }
  Book.find(criteria)
      .exec()
      .then(books => {
        if (books.length > 0) {
          res.status(200).json({
            books: books
          });
        } else {
          res.status(404).json({ message: "No books found based on provided criteria" });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
      });
};

exports.books_delete = (req, res, next) => {
  const id = req.params.bookId;
  Book.deleteOne({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Book deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/books" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};
