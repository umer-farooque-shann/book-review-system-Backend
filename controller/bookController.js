import { User } from "../models/User.js";
import  Book  from "../models/Book.js"

export const addBook = async (req, res) => {
  try {
    
    const { title, description, image } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const newBook = new Book({
      title,
      author: user.name, 
      description,
      image,
      userId
    });
    await newBook.save();
    res.status(201).json({ book: newBook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add book' });
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find(); // Retrieve all books from the database
    res.status(200).json({ books }); // Send the books as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

export const findBookBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const book = await Book.findOne({ slug });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to find book' });
  }
};

