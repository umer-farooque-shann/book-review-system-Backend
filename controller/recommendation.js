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

        let cleanedString = genreString.replace(/^\[|\]$/g, '');
        cleanedString = cleanedString.replace(/'/g, '');
        cleanedString = cleanedString.trim();
        return cleanedString.split(', ');
    } catch (error) {
        console.error('Error parsing genre string:', error);
        return [];
    }
};

const calculateSimilarity = (userGenres, bookGenres) => {
    const intersection = userGenres.filter(genre => bookGenres.includes(genre));
    const union = [...new Set([...userGenres, ...bookGenres])];
    const similarity = intersection.length / union.length;
    return similarity;
};

const filterBooks = async (userId) => {
    try {
        const user = await User.findById(userId);
        
        if (!user || !user.preferredGenres || user.preferredGenres.length === 0) {
            throw new Error('User or preferred genres not found or empty');
        }

        const userGenres = user.preferredGenres.map(genre => genre.toLowerCase());

        const matchingBooks = [];
        const books = await Book.find();

        for (const book of books) {
            const bookGenres = parseGenreString(book.genres);
            const similarity = calculateSimilarity(userGenres, bookGenres);
            if (similarity > 0.2) {
                matchingBooks.push({ book, similarity });
            }
        }
        matchingBooks.sort((a, b) => b.similarity - a.similarity);
        return matchingBooks.slice(0, 10).map(item => item.book);
    } catch (error) {
        throw error;
    }
};

export const getFilteredBooks = async (req, res) => {
    try {
        const userId = req.user.id; 
        const matchingBooks = await filterBooks(userId);
        res.json(matchingBooks);
    } catch (error) {
        console.error('Error filtering books:', error); 
        res.status(500).json({ error: 'Internal server error' });
    }
};
