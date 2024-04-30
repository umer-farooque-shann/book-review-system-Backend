import express from "express";
import Book from "../models/Book.js";
import { authenticate } from "../middleware/authenticate.js";
import { addBook ,getAllBooks,findBookBySlug,reviewBook,getBookRating ,getAverageRating } from "../controller/bookController.js";
import upload from "../middleware/multerMiddleware.js";

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

router.post('/book/:slug/review', reviewBook);
router.get('/book/:slug/rating', getBookRating);
router.get('/books/:slug/average-rating', getAverageRating);


export default router