const googleAuth = require('./src/google-oauth/google-oauth');
const {login, getEvents} = require('./src/epitech-calendar/epitech-calendar');
const {google} = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();


const eventTemplate = ({title, room, start, end, color}) => ({
    'summary': title,
    'description': 'This course take place in the room: ' + room,
    'start': {
        'dateTime': start.toISOString(),
        'timeZone': process.env.TIME_ZONE || 'Europe/Paris'
    },
    'end': {
        'dateTime': end.toISOString(),
        'timeZone': process.env.TIME_ZONE || 'Europe/Paris'
    },
    'colorId': color
});

const CALENDAR_ID = process.env.CALENDAR_ID;
const IMPORTANT_EVENT_COLOR_ID = process.env.IMPORTANT_EVENT_COLOR_ID;

async function main(auth) {
    await login();

    const activities = await getEvents(new Date().toISOString().split('T')[0], '2020-06-30');

    const calendar = google.calendar({version: 'v3', auth});

    activities.map(el => {
        if (el.title.includes('Delivery') || el.title.includes('Follow-up') || el.title.includes('Evaluation') || el.title.includes('Review')) {
            el.color = IMPORTANT_EVENT_COLOR_ID;
        } else {
            el.color = undefined;
        }
        calendar.events.insert({
            auth: auth,
            calendarId: CALENDAR_ID,
            resource: eventTemplate(el)
        }, function(err, event) {
            if (err) return console.error('There was an error contacting the Calendar service:', err);
            console.log('Event created:', event.data);
        });
    })
}

googleAuth(main);