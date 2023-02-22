const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const async = require("async");
const { body, validationResult } = require("express-validator");
const mongoose = require('mongoose');


// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate("book")
    .exec(function (err, list_bookinstances) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstances
          .sort((a, b, index) => {
            a = a.book.title
            b = b.book.title
            if (a < b) {
              return -1;
            } else if (a > b) {
              return 1;
            } else {
              return 0;
            }
          }),
      });
    });
};


// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
      .populate('book')
      .exec((err, instance_book) => {
        if (err) {
          return next(err);
        }
        if (instance_book === null) {
          const new_err = new Error('Book Instance Not Found');
          new_err.status = 404;
          return next(new_err);
        }
        // Sucessful, so render
        res.render('book_instance_detail', {
          title: 'Book Instance Detail',
          book_instance: instance_book,
          book: instance_book.book,
        })
      });
  //res.send(`NOT IMPLEMENTED: BookInstance detail: ${req.params.id}`);
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
  // Find all books
  Book.find()
    .sort({title: 1})
    .exec(function(err, books) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render('bookinstance_form', {
        title: 'Create Book Instance',
        books,
        statuses: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
      })
    });

  //res.send("NOT IMPLEMENTED: BookInstance create GET");
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Add suffix to the time to ensure date is not off by one day
  (req, res, next) => {
    req.body.due_back += 'T00:00:00';
    next();
  },

  // validate and sanitize
  // save a new bookinstance to a variable
  // if errors, render sanitized inputs and error messages
  // else save the new book instance

  body('book')
    .trim()
    .isLength( {min: 1} )
    .escape()
    .withMessage('Invalid book'),
  body('imprint')
    .trim()
    .isLength( {min: 1} )
    .escape()
    .withMessage('Imprint must not be empty'),
  body('status')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Status must not be empty'),
  body('date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  
  function(req, res, next) {

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      Book.find()
        .sort({ title: 1 })
        .exec(function (err, books) {
          if (err) {
            return next(err);
          }
          // Success, so render
          res.render('bookinstance_form', {
            title: "Create Book Instance",
            books,
            selected_book: bookinstance.book,
            errors: errors.array(),
            bookinstance,
            statuses: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
            selected_status: bookinstance.status,
          });
        });   
    } else {
      // No errors so, save
      bookinstance.save((err) => {
        if (err) {
          return next(err);
        }
        // Successful: redirect to new record.
        res.redirect(bookinstance.url);
      });
    }

   
  },

  //res.send("NOT IMPLEMENTED: BookInstance create POST");
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance delete GET");
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance delete POST");
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
};
