const express = require('express');
const fs = require('fs');
const path = require('path');
const { app: electronApp } = require('electron');
const app = express();
const PORT = 8080;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());

const DATA_PATH = path.join(electronApp.getPath('userData'), 'history.json');

if (!fs.existsSync(DATA_PATH)) {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify([]));
}

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

app.listen(PORT, () => {
    console.log(`Server RUN!`);
});

module.exports = app;