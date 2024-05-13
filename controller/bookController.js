import  User  from "../models/User.js";
import  Book  from "../models/Book.js"
import Review from "../models/Review.js";
  
export const addBook = async (req, res) => {
  try {
    const { title, author, description, genres } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }
    const image = req.file.path;

    // Parse genres from JSON string
    const parsedGenres = JSON.parse(genres);

    const newBook = new Book({
      title,
      author, // Use the provided author field
      description,
      image,
      userId,
      genres: parsedGenres
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

export const getAllCounts = async (req, res) => {
  try {
    const bookCount = await Book.countDocuments();
    const userCount = await User.countDocuments();
    res.status(200).json({ bookCount, userCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch counts' });
  }
};

export const findBookBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const book = await Book.findOne({ slug });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const recommendations = await Book.find({ genres: { $in: book.genres }, _id: { $ne: book._id } }).limit(5);

    res.status(200).json({ book, recommendations }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to find book and recommendations' });
  }
};

export const reviewBook = async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId, rating, reviewText } = req.body;

    const book = await Book.findOne({ slug });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    let existingReview = await Review.findOne({ user: userId, book: book._id });
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.reviewText = reviewText;
      await existingReview.save();
      return res.status(200).json({ message: 'Review updated successfully' });
    }

    const newReview = new Review({
      user: userId,
      book: book._id,
      rating,
      reviewText
    });
    await newReview.save();

    return res.status(201).json({ message: 'Review created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookRating = async (req, res) => {
  try {
    const { slug } = req.params;

    const book = await Book.findOne({ slug });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const reviews = await Review.find({ book: book._id });

    if (reviews.length === 0) {
      return res.status(200).json({ rating: 0, message: 'No reviews yet' });
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return res.status(200).json({ rating: averageRating });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAverageRating = async (req, res) => {
  const { slug } = req.params;
  try {
    const book = await Book.findOne({ slug });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const reviews = await Review.find({ book: book._id });

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this book' });
    }
    let totalRating = 0;
    reviews.forEach(review => {
      totalRating += review.rating;
    });
    const averageRating = totalRating / reviews.length;
    const uniqueUsers = new Set(reviews.map(review => review.user.toString()));
    const usersCount = uniqueUsers.size;

    return res.status(200).json({ averageRating, usersCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addBookToUser = async (req, res) => {
  const { userId, bookId } = req.body; // Assuming you're sending the user ID along with the book ID
  
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // Check if the book is already in the user's collection
    if (user.books.includes(bookId)) {
      // If the book is already in the collection, send a response indicating that
      return res.status(400).json({ error: 'Book already exists in user collection' });
    }

    // If the book is not in the collection, push the book ID into the books array
    user.books.push(bookId);
    
    // Save the updated user document
    await user.save();

    // Send a response indicating success
    res.status(200).json({ message: 'Book added to user collection', user });
  } catch (error) {
    // Handle error and send a response with an error message
    console.error('Error adding book to user collection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserBooks = async (req, res) => {
  try {
    // Assuming you have middleware that verifies the JWT token and adds the user ID to the request object
    const userId = req.user.id;

    // Find the user by ID and populate the books array with details of each book
    const user = await User.findById(userId).populate('books');

    // If user not found, return a 404 Not Found response
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send the user's books with all details as a response
    res.status(200).json({ books: user.books });
  } catch (error) {
    // Handle error and send a response with an error message
    console.error('Error fetching user books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const removeBookFromUser = async (req, res) => {
  try {
    // Ensure that the request body contains the book ID
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // Get the user ID from the request object (assuming it's added by authentication middleware)
    const userId = req.user.id;

    // Find the user by ID and remove the specified book from their collection
    const user = await User.findByIdAndUpdate(userId, { $pull: { books: bookId } }, { new: true });

    // If user not found, return a 404 Not Found response
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the book was successfully removed from the user's collection
    if (!user.books.includes(bookId)) {
      return res.status(404).json({ error: 'Book not found in user collection' });
    }

    // Send a response indicating success
    res.status(200).json({ message: 'Book removed from user collection', user });
  } catch (error) {
    // Handle error and send a response with an error message
    console.error('Error removing book from user collection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReadCount = async (req,res) => {
  try {
    // Get the authenticated user's ID from the request object
    const userId = req.user.id;

    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract book counts from the user object
    const { read, currentlyReading, wantToRead } = user;

    // Send the book counts in the response
    res.status(200).json({
      bookCounts: {
        read: read.length,
        currentlyReading: currentlyReading.length,
        wantToRead: wantToRead.length
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Server error' });
  }
};