const http = require('http');

http.get('http://localhost:5174/images/icons.svg', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log("Fetched icons.svg length:", data.length);
        console.log("Contains id=\"usp\":", data.includes('id="usp"'));
    });
}).on('error', (err) => {
    console.error("Error fetching:", err.message);
});
