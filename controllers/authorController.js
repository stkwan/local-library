const Author = require("../models/author");
const Book = require("../models/book");

const { body, validationResult } = require("express-validator");
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
exports.author_create_get = (req, res, next) => {
  res.render('author_form', {
    title: 'Create Author'
  });
  //res.send("NOT IMPLEMENTED: Author create GET");
};

// Handle Author create on POST.
exports.author_create_post = [
  // Add suffix to the time to ensure date is not off by one day
  (req, res, next) => {
    req.body.date_of_birth += 'T00:00:00';
    req.body.date_of_death += 'T00:00:00';
    next();
  },

  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("author_form", {
        title: "Create Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Create an Author object with escaped and trimmed data.
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });
    author.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new author record.
      res.redirect(author.url);
    });
  },
];

// Display Author delete form on GET.
exports.author_delete_get = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authors_books(callback) {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.author == null) {
        // No results.
        res.redirect("/catalog/authors");
      }
      // Successful, so render.
      res.render("author_delete", {
        title: "Delete Author",
        author: results.author,
        author_books: results.authors_books,
      });
    }
  );
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.body.authorid).exec(callback);
      },
      authors_books(callback) {
        Book.find({ author: req.body.authorid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.authors_books.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render("author_delete", {
          title: "Delete Author",
          author: results.author,
          author_books: results.authors_books,
        });
        return;
      }
      // Author has no books. Delete object and redirect to the list of authors.
      Author.findByIdAndRemove(req.body.authorid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect("/catalog/authors");
      });
    }
  );
};


// Display Author update form on GET.
exports.author_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.author_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};
