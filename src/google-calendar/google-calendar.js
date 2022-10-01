const {google} = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const eventTemplate = ({title, room, start, end, color}) => ({
    'summary': title,
    'description': 'This course take place in the room: ' + room,
    'start': {
        'dateTime': start,
    },
    'end': {
        'dateTime': end,
    },
    'colorId': color
});

const CALENDAR_ID = process.env.CALENDAR_ID;

async function getEventGC(evt, auth) {
    const calendar = google.calendar({version: 'v3', auth});

    calendar.events.get({
        auth: auth,
        calendarId: CALENDAR_ID,
        eventId: evt.event_id
    }, (err, event) => {
        if (err) throw err;
console.log(event);
        if (event.status === "cancelled") {
            console.log("adding event")
            addEventGC(evt, dbo, auth);
        }
    })

}

function updateEventGC(eventId, db, auth) {
    const calendar = google.calendar({version: 'v3', auth});

    calendar.events.update({
        auth: auth,
        calendarId: CALENDAR_ID,
        resource: {
            'status': "confirmed"
        }
    }, (err, data) => {
        if (err) throw err;

        console.log(data)
    })
}

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
            room: event.room,
            codeacti: event.codeacti
        };
        console.log(eventGC)
        dbo.collection('events').insertOne(eventDB, (err, res) => {
            if (err) throw err;
            console.log(`Event ${eventGC.data.id} added to database.`);
        });
    });
}

module.exports = {
    addEventGC,
    removeEventGC,
    getEventGC
};