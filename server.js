const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();
const { parse } = require('csv-parse'); // ✅ Make sure this is included

const csvPath = path.join(__dirname, 'public', 'airnb.csv');
const jsonPath = path.join(__dirname, 'public', 'data.json');

// Convert CSV to JSON
function convertCSVtoJSON() {
    fs.readFile(csvPath, 'utf8', (err, data) => {
        if (err) return console.error('Error reading CSV:', err);

        parse(data, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        }, (err, output) => {
            if (err) return console.error('CSV parse error:', err);

            fs.writeFile(jsonPath, JSON.stringify(output, null, 2), err => {
                if (err) return console.error('Error writing JSON:', err);
                console.log('✅ Clean JSON written to data.json');
            });
        });
    });
}

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server and convert CSV
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    convertCSVtoJSON(); // <-- run conversion after server starts
});
