const nodeFetch = require('node-fetch');
const fetch = require('fetch-cookie')(nodeFetch);

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const TOKEN_PATH = 'token.json';

fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), main);
  });

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }




async function login() {
    await fetch('https://intra.epitech.eu/auth-a09d92a10655231a195590024eb2a14f5771ce20/user/?format=json');
}

async function main(auth) {
    await login();
    const activities = await fetch(`https://intra.epitech.eu/planning/load?format=json&start=2020-03-05&end=2020-06-30`)
    .then(res => res.json());
    const my_activities = activities.filter(el => el.event_registered === 'registered').map(el => {
        return {
            title: el.acti_title,
            room: el.room && el.room.code && el.room.code.split('/')[3],
            start: new Date(el.start),
            end: new Date(el.end)
        }
    }).sort((ap1, ap2) => {
        if (ap1.start > ap2.start)
        return 1;
        if (ap1.start < ap2.start)
        return -1;
        return 0;
    });

    const calendar = google.calendar({version: 'v3', auth});
    my_activities.map((el, i) => {
        if (i > 1) {
            return;
        }
        const event = {
            'summary': el.title,
            'description': 'This course take place in the room: ' + el.room,
            'start': {
              'dateTime': el.start.toISOString(),
              'timeZone': 'Europe/Paris',
            },
            'end': {
              'dateTime': el.end.toISOString(),
              'timeZone': 'Europe/Paris',
            }
          };
        calendar.events.insert({
            auth: auth,
            calendarId: 'a7b8dibef1ec0oks5p86bkqopk@group.calendar.google.com',
            resource: event
        }, function(err, Cevent) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
          }
          console.log('Event created: %s\n%s', Cevent.data, event.start);
          setTimeout(() => {
            calendar.events.delete({
                auth: auth,
                calendarId: 'a7b8dibef1ec0oks5p86bkqopk@group.calendar.google.com',
                eventId: Cevent.data.id
            }, function(err, event) {
                if (err) {
                    console.log('There was an error deleting event');
                    return;
                }
                console.log('Event deleted');
            });
          }, 25000)
        });
    })

}