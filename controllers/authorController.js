const Author = require("../models/author");
const Book = require("../models/book");

const async = require("async");

// Display list of all Authors.
exports.author_list = (req, res, next) => {
  Author.find()
    .sort({family_name: 1})
    .exec(function(err, list_author) {
      if (err) {
        return next(err)
      }
      // Sucessful, so render
      res.render('author_list', {
        title: 'Author List',
        authors: list_author,
      });
    });
    // res.send("NOT IMPLEMENTED: Author list");
};

// Display detail page for a specific Author.
exports.author_detail = (req, res, next) => {
  // Use async.parallel to query both the author model and the book model (remember to require (i.e. import) both models at the top of the file)
  // Find the author whose id matches req.params.id
  // Find the books that have req.params.id as a value for the author
  // In the last callback, render the data using a new view
  async.parallel({
    //tasks (async functions defnined in a javascript object)
    target_author: function(callback) {
      Author.findById(req.params.id).exec(callback);
    },
    target_books: function(callback) {
      Book.find({ author: req.params.id})
        .populate('genre')
        .sort({ title: 1})
        .exec(callback);
    },
   },
    function(err, results) {
      if (err) {
        // if err has a value then there was a error
        // return and pass error to next middleware handler
        return next(err);
      }
      // If author not found:
      if (results.author === null) {
        const err = new Error("Author not found.")
        err.status = 404
        return next(err);
      }
      // Sucessful, so render
      res.render('author_detail', {
        // define key value pairs to be rendered
        title: 'Author',
        author: results.target_author,
        books: results.target_books,
      });
    }
  )
  //res.send(`NOT IMPLEMENTED: Author detail: ${req.params.id}`);
};

// Display Author create form on GET.
exports.author_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create GET");
};

// Handle Author create on POST.
exports.author_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create POST");
};

// Display Author delete form on GET.
exports.author_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET.
exports.author_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.author_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};