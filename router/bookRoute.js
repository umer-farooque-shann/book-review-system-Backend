import express from "express";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  deleteBook,
  getReadCount,
  getAllCounts, 
  addBook ,
  getAllBooks,
  findBookBySlug,
  reviewBook,
  getBookRating ,
  getAverageRating ,
  addBookToUser,
  getUserBooks,
  removeBookFromUser,
  getReviews
} from "../controller/bookController.js";
import upload from "../middleware/multerMiddleware.js";
import { getFilteredBooks } from "../controller/recommendation.js";
import { createContact,getAllContacts ,deleteContactById} from "../controller/contactController.js";
import { createRequest,getAllRequests } from "../controller/requestController.js";

const router = express.Router()

router.post('/add_book',authenticate,upload.single('image'),addBook)
router.get('/v1/book',authenticate, getAllBooks)
router.get('/v1/book/:slug',authenticate,findBookBySlug )
router.get('/books/search',authenticate, async (req, res) => {
    const searchTerm = req.query.term;
    try {
      const books = await Book.find({ $text: { $search: searchTerm } });
      res.json(books);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error searching books' });
    }
  });
router.post('/book/:slug/review',authenticate, reviewBook);
router.get('/book/:slug/rating',authenticate, getBookRating);
router.get('/books/:slug/average-rating',authenticate, getAverageRating);
router.post('/add-book-to-user',authenticate,addBookToUser)
router.get('/get-user-book',authenticate,getUserBooks)
router.delete('/deleteBook/:slug',authenticate,deleteBook)
router.post('/remove-book',authenticate, removeBookFromUser);
router.post('/:listType/:slug', authenticate, async (req, res) => {
  const { listType, slug } = req.params;

  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const book = await Book.findOne({ slug });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Ensure that listType is one of 'currentlyReading', 'wantToRead', or 'read'
    if (!['currentlyReading', 'wantToRead', 'read'].includes(listType)) {
      return res.status(400).json({ message: 'Invalid list type' });
    }

    // Remove the book from other lists
    const lists = ['currentlyReading', 'wantToRead', 'read'];
    lists.forEach(list => {
      if (list !== listType) {
        user[list] = user[list].filter(bookId => bookId.toString() !== book._id.toString());
      }
    });

    // Add the book to the selected list
    if (!user[listType].includes(book._id)) {
      user[listType].push(book._id);
    }

    await user.save();

    return res.status(200).json({ message: ` ${listType} ` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/get-user-book-count',authenticate,getReadCount)
router.get('/book-recommendation',authenticate,getFilteredBooks)
router.get('/get-count-data',authenticate,getAllCounts)
router.post('/contactpost',authenticate,createContact)
router.get('/contactget',authenticate,getAllContacts)
router.delete('/deleteContact/:id',authenticate,deleteContactById)
router.post("/createRequest",authenticate,createRequest)
router.get('/getAllRequests',authenticate,getAllRequests)
router.get('/getReviews/:slug/reviews',authenticate,getReviews)

export default router