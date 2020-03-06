const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const TOKEN_PATH = './auth/token.json';

module.exports = function oauth2google(cb) {
    fs.readFile('./auth/credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), cb);
    })

    function authorize(credentials, cb) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, cb);
            oAuth2Client.setCredentials(JSON.parse(token));
            cb(oAuth2Client);
        })
    }

    function getAccessToken(oAuth2Client, cb) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                cb(oAuth2Client);
            })
        })
    }
}