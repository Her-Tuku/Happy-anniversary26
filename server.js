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
        req.session.canSeeHome = true; // One-time pass for index.html
        res.json({ success: true, message: 'Welcome Bibijaan 🤍' });
    } else {
        res.json({ success: false, message: 'You are either the wrong person or typing it wrong! ⚠️' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// SECURE FILE SERVER: Only serves Anniversary content AFTER login
app.get('*', checkAuth, (req, res) => {
    const isHome = (req.path === '/' || req.path === '/index.html');
    
    if (isHome) {
        if (req.session.canSeeHome) {
            req.session.canSeeHome = false; // "Consume" the pass so reload fails
            return res.sendFile(path.join(__dirname, 'index.html'));
        } else {
            // Force re-login on reload
            req.session.authenticated = false;
            return res.redirect('/login');
        }
    }

    let requestedFile = req.path;
    const fullPath = path.join(__dirname, requestedFile);

    // List of files that are NEVER allowed to be served publicly
    const forbidden = ['server.js', 'package.json', 'node_modules', 'login.html'];
    if (forbidden.some(f => requestedFile.includes(f))) {
        return res.status(403).send('Forbidden');
    }

    if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
        res.sendFile(fullPath);
    } else {
        res.status(404).send('Not Found');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});
