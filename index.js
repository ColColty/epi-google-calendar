const googleAuth = require('./src/google-oauth/google-oauth');
const {getEvents} = require('./src/epitech-calendar/epitech-calendar');
const dotenv = require('dotenv');
dotenv.config();
const cron = require('node-cron');
const MongoClient = require('mongodb').MongoClient;
const URL_DB = "mongodb://mongo:27017/";
const { addEventGC, removeEventGC, getEventGC } = require('./src/google-calendar/google-calendar');
const { google } = require('googleapis');

const IMPORTANT_EVENT_COLOR_ID = process.env.IMPORTANT_EVENT_COLOR_ID;
const IMPORTANT_EVENTS_NAMES = ["Delivery", "Follow-up", "Evaluation", "Review", "Keynote", "Meetings"];


async function canAddEvent(evt, dbo, auth) {
    let data = false;
    await dbo.collection('events').find({codeacti: evt.codeacti}).toArray((err, res) => {
        if (err) throw err;

        if (res.length) {
            res.forEach(el => {
                console.log(el.start, evt.start)
                if (el.start !== evt.start || el.end !== evt.end) {
                    data = true;
                    removeEventGC(el.event_id, dbo, auth)
                    return
                }
                console.log("Check if event exists", el)
                getEventGC(el, auth)
            })
        } else {
            data = true
        }
    })

    return data
}

MongoClient.connect(URL_DB, (err, db) => {
    if (err) {
        console.log("Can't connect to Database.");
        throw err;
    }
    console.log("Connected to DB !");

    const dbo = db.db('epi-google-calendar');

    // dbo.createCollection('events', (err, res) => {
    //     if (err) throw err;
    // })

    async function main(auth) {
        let today = new Date()
        let nextWeek = new Date()
        nextWeek.setDate(today.getDate() + 1)
        const activities = await getEvents(today.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0]);

        const parsedActivities = activities.map(el => {
            if (new RegExp(IMPORTANT_EVENTS_NAMES.join("|")).test(el.title)) {
                el.color = IMPORTANT_EVENT_COLOR_ID;
            } else {
                el.color = undefined;
            }
            el.start = new Date(el.start).toISOString();
            el.end = new Date(el.end).toISOString();

            return el;
        })
        .filter(el => canAddEvent(el, dbo, auth))
        .map(el => {
            dbo.collection('events').find({title: el.title, start: el.start, end: el.end}).toArray((err, res) => {
                if (err) throw err;

                if (res.length === 0) {
                    addEventGC(el, dbo, auth)
                } else {
                    console.log("Event not added to the calendar, already exists");
                }
            });
        });
    }

    // cron.schedule('*/5 * * * *', () => {
    googleAuth(main);
    // });
})
