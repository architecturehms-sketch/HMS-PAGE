const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('--- ERROR RECEIVED FROM BROWSER ---');
      console.log(body);
      fs.appendFileSync('browser-errors.log', body + '\n');
      res.end('ok');
    });
  } else {
    res.end('running');
  }
});

server.listen(9999, () => {
  console.log('Error logger listening on port 9999');
});
