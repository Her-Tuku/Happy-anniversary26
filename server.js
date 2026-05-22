const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// THE PASSWORD
const PASSWORD = 'LoveBird=Tuku-Tuki-05.03.2025';

// Session config
app.use(session({
    secret: 'bibijaan-secret-highly-secure',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: null // Session expires when browser is closed
    }
}));

app.use(bodyParser.urlencoded({ extended: true }));

// Auth Middleware: Prevents seeing personal content unless logged in
const checkAuth = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Route: Handle Login
app.get('/login', (req, res) => {
    if (req.session.authenticated) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
        req.session.authenticated = true;
        req.session.canSeeHome = true;
        res.json({ success: true, message: 'Welcome Bibijaan 🤍' });
    } else {
        res.json({ success: false, message: 'Wrong password! ⚠️' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Protect index.html specifically
app.get(['/', '/index.html'], (req, res, next) => {
    if (req.session.authenticated && req.session.canSeeHome) {
        req.session.canSeeHome = false; // Prevent logic reload loop
        return res.sendFile(path.join(__dirname, 'index.html'));
    } else if (req.session.authenticated) {
        // If already authenticated but hitting / again, might need a refresh of session
        // or just stay on index. For your specific "force login on reload" request:
        req.session.authenticated = false;
        return res.redirect('/login');
    } else {
        res.redirect('/login');
    }
});

// Serve assets (images, mp3, css, js) with Auth check but more efficiently
app.use(checkAuth, express.static(__dirname, {
    index: false,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mp3')) {
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Type', 'audio/mpeg');
        }
    }
}));

// Fallback for everything else
app.get('*', checkAuth, (req, res) => {
    res.status(404).send('Not Found');
});

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});
