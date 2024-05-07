import User from "../models/User.js";
import Book from "../models/Book.js";

const parseGenreString = (genreInput) => {
    try {
        let genreString;
        if (Array.isArray(genreInput)) {
            genreString = genreInput.join(', '); // Convert array to string
        } else if (typeof genreInput === 'string') {
            genreString = genreInput;
        } else {
            throw new Error('Invalid input type');
        }

        console.log('Genre string:', genreString); // Add this line for logging

        let cleanedString = genreString.replace(/^\[|\]$/g, '');
        cleanedString = cleanedString.replace(/'/g, '');
        cleanedString = cleanedString.trim();
        return cleanedString.split(', ');
    } catch (error) {
        console.error('Error parsing genre string:', error);
        return [];
    }
};



const filterBooks = async (userId) => {
    try {
        const user = await User.findById(userId);
        
        if (!user || !user.preferredGenres || user.preferredGenres.length === 0) {
            throw new Error('User or preferred genres not found or empty');
        }

        const userInterests = user.preferredGenres.map(genre => genre.toLowerCase());

        const matchingBooks = [];
        const books = await Book.find(); // Assuming you have a Book model

        for (const book of books) {
            const rowGenres = parseGenreString(book.genres);
            for (const userInterest of userInterests) {
                if (rowGenres.some((genre) => genre.toLowerCase().includes(userInterest))) {
                    matchingBooks.push(book);
                    break;
                }
            }
        }

        return matchingBooks.slice(0, 10);
    } catch (error) {
        throw error;
    }
};

export const getFilteredBooks = async (req, res) => {
    try {
        const userId = req.user.id; 
        console.log(req.user.id);
        const matchingBooks = await filterBooks(userId);
        res.json(matchingBooks);
    } catch (error) {
        console.error('Error filtering books:', error); // Log the error message
        res.status(500).json({ error: 'Internal server error' });
    }
};

