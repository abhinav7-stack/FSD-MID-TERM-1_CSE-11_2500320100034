
const express = require('express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// In-memory array
let books = [];
let nextId = 1;


// TASK 2: Add a new book
// POST /api/books

app.post('/api/books', (req, res) => {
    const { title, author, genre, isbn, totalCopies } = req.body;

    if (!title || !author || !genre || !isbn ||
        !Number.isInteger(totalCopies) || totalCopies < 1) {
        return res.status(400).json({
            message: 'Please provide valid book details'
        });
    }

    const newBook = {
        id: nextId++,
        title,
        author,
        genre,
        isbn,
        totalCopies,
        availableCopies: totalCopies
    };

    books.push(newBook);

    res.status(201).json({
        message: 'Book added successfully',
        book: newBook
    });
});


// TASK 3: Retrieve all books
// GET /api/books

app.get('/api/books', (req, res) => {
    if (books.length === 0) {
        return res.status(200).json({
            message: 'No books available in library',
            books: []
        });
    }

    res.status(200).json(books);
});


// TASK 3: Retrieve book by ID
// GET /api/books/:id

app.get('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    res.status(200).json(book);
});


// TASK 4: Update book details
// PUT /api/books/:id

app.put('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    const { title, author, genre, isbn, totalCopies } = req.body;

    if (
        (totalCopies !== undefined &&
        (!Number.isInteger(totalCopies) ||
        totalCopies < book.totalCopies - book.availableCopies)) ||
        (title !== undefined && typeof title !== 'string') ||
        (author !== undefined && typeof author !== 'string') ||
        (genre !== undefined && typeof genre !== 'string') ||
        (isbn !== undefined && typeof isbn !== 'string')
    ) {
        return res.status(400).json({
            message: 'Invalid book details or total copies'
        });
    }

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (genre !== undefined) book.genre = genre;
    if (isbn !== undefined) book.isbn = isbn;

    if (totalCopies !== undefined) {
        book.availableCopies += totalCopies - book.totalCopies;
        book.totalCopies = totalCopies;
    }

    res.status(200).json({
        message: 'Book updated successfully',
        book: book
    });
});


// TASK 5: Delete a book
// DELETE /api/books/:id

app.delete('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    if (books[index].availableCopies !== books[index].totalCopies) {
        return res.status(409).json({
            message: 'Cannot delete book while copies are issued'
        });
    }

    const deletedBook = books.splice(index, 1);

    res.status(200).json({
        message: 'Book deleted successfully',
        book: deletedBook[0]
    });
});


// TASK 6: Search books
// GET /api/books/search?title=...

app.get('/api/books/search', (req, res) => {
    const { title, author, genre } = req.query;

    if (!title && !author && !genre) {
        return res.status(400).json({
            message: 'Provide title, author or genre to search'
        });
    }

    const result = books.filter(book => {
        return (
            (!title || book.title.toLowerCase().includes(title.toLowerCase())) &&
            (!author || book.author.toLowerCase().includes(author.toLowerCase())) &&
            (!genre || book.genre.toLowerCase().includes(genre.toLowerCase()))
        );
    });

    res.status(200).json({
        message: result.length ? 'Books found' : 'No matching books found',
        books: result
    });
});


// TASK 7: Issue a book copy
// POST /api/books/:id/issue

app.post('/api/books/:id/issue', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    if (book.availableCopies <= 0) {
        return res.status(400).json({
            message: 'No copies available for issue'
        });
    }

    book.availableCopies--;

    res.status(200).json({
        message: 'Book issued successfully',
        book: book
    });
});


// TASK 7: Return a book copy
// POST /api/books/:id/return

app.post('/api/books/:id/return', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    if (book.availableCopies >= book.totalCopies) {
        return res.status(400).json({
            message: 'No issued copies to return'
        });
    }

    book.availableCopies++;

    res.status(200).json({
        message: 'Book returned successfully',
        book: book
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
