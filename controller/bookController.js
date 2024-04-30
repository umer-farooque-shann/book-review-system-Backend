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
