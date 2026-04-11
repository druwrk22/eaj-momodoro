const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data', 'history.json');

app.get('/', (req, res) => {
    const history = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    res.render('index', { history });
});

app.post('/save-session', (req, res) => {
    const { title, type, date } = req.body; 
    const history = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    
    history.unshift({ 
        title: title || "Untitled Task", 
        type, 
        date 
    });
    
    fs.writeFileSync(DATA_PATH, JSON.stringify(history.slice(0, 10), null, 2));
    res.status(200).json({ message: 'Saved!' });
});

app.delete('/clear-history', (req, res) => {
    fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2));
    res.status(200).json({ message: 'History cleared!' });
});

app.listen(3000, () => console.log('Server running on http://localhost:8080'));