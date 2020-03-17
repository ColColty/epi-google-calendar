const {google} = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const eventTemplate = ({title, room, start, end, color}) => ({
    'summary': title,
    'description': 'This course take place in the room: ' + room,
    'start': {
        'dateTime': start,
        'timeZone': process.env.TIME_ZONE || 'Europe/Paris'
    },
    'end': {
        'dateTime': end,
        'timeZone': process.env.TIME_ZONE || 'Europe/Paris'
    },
    'colorId': color
});

const CALENDAR_ID = process.env.CALENDAR_ID;

function removeEventGC(eventId, db, auth) {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.delete({
        auth: auth,
        calendarId: CALENDAR_ID,
        eventId: eventId
    }, (err, event) => {
        if (err) throw err;
        db.collection('events').deleteOne({event_id: eventId}, (err, res) => {
            console.log('Event removed:', eventId);
        });
    });
}

function addEventGC(event, dbo, auth) {
    const calendar = google.calendar({version: 'v3', auth});
    dbo.collection('events').find({title: event.title, start: event.start, end: event.end}).toArray((err, res) => {
        if (err) throw err;

        if (res.length === 0) {
            calendar.events.insert({
                auth: auth,
                calendarId: CALENDAR_ID,
                resource: eventTemplate(event)
            }, function(err, eventGC) {
                if (err) return console.error('There was an error contacting the Calendar service:', err);
                const eventDB = {
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    event_id: eventGC.data.id,
                    room: event.room
                };
                dbo.collection('events').insertOne(eventDB, (err, res) => {
                    if (err) throw err;
                    console.log(`Event ${eventGC.data.id} added to database.`);
                });
                setTimeout(() => {
                    removeEventGC(eventGC.data.id, dbo, auth);
                }, 30000);
            });
        } else {
            console.log("Event not added to the calendar, already exists");
        }
    });
}

module.exports = {
    addEventGC,
    removeEventGC
};