// routes/autocomplete.js
const express = require('express');
const Trie = require('../trie');
const Word = require('../models/Word');

const router = express.Router();
const trie = new Trie();

// Build the Trie with words from the database
Word.find().then(words => {
    words.forEach(word => trie.insert(word.text));
});

// API route for autocomplete
router.get('/search', (req, res) => {
    const { q } = req.query;
    const suggestions = trie.autocomplete(q);
    res.json(suggestions);
});

// API route to add new words
router.post('/add-word', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Word is required' });

    try {
        const newWord = new Word({ text });
        await newWord.save();
        trie.insert(text); // Add word to the Trie
        res.status(201).json({ message: 'Word added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add word' });
    }
});

// API route to delete a word
router.delete('/delete-word', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Word is required' });

    try {
        // Delete the word from the Trie
        trie.delete(text);
        
        // Delete the word from the database
        await Word.deleteOne({ text });
        res.status(200).json({ message: 'Word deleted successfully' });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'There was an issue deleting the word. Please try again.' });
    }
});

module.exports = router;
