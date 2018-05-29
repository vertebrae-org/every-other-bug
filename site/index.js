'use strict';

const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(path.join(__dirname, '..'));
const distDir = root;
const isProduction = process.env.NODE_ENV === 'production';
//get compiled index file and match face or markerless
const index = fs.existsSync(`${distDir}/index.html`);
if (!index) {
    throw new Error('No index.html found, use "node compile [ face | markerless ]"');
}
let server;

//support for SSL
if (isProduction) {
    //production is behind an ELP that forwards 443 -> 8080
    server = http.createServer(app).listen(8080);
} else {
    const options = {
        key: fs.readFileSync(__dirname + '/domain.key'),
        cert: fs.readFileSync(__dirname + '/domain.crt')
    };
    const https = require('https');
    server = https.createServer(options, app).listen(8080);
}

//health endpoint for ELB
app.get('/status', (req, res) => {
	res.send('Ok');
});

app.use(require('compression')());
app.use(express.static(`${distDir}`));
/* expects index to already be generated and handled by static
app.get('/', function (req, res) {
    res.send(html);
});
*/

app.listen(() => {
    process.stdout.write(`Port ${server.address().port} opened!\n`);
});
