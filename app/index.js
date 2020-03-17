const googleAuth = require('./src/google-oauth/google-oauth');
const {login, getEvents} = require('./src/epitech-calendar/epitech-calendar');
const dotenv = require('dotenv');
dotenv.config();
const cron = require('node-cron');
const MongoClient = require('mongodb').MongoClient;
const URL_DB = "mongodb://mongo:27017/";
const {addEventGC} = require('./src/google-calendar/google-calendar');

const IMPORTANT_EVENT_COLOR_ID = process.env.IMPORTANT_EVENT_COLOR_ID;
const IMPORTANT_EVENTS_NAMES = ["Delivery", "Follow-up", "Evaluation", "Review", "Keynote", "Meetings"];


MongoClient.connect(URL_DB, (err, db) => {
    if (err) {
        console.log("Can't connect to Database.");
        throw err;
    }
    console.log("Connected to DB !");

    const dbo = db.db('epi-google-calendar');

    dbo.createCollection('events', (err, res) => {
        if (err) throw err;
    })

    async function main(auth) {
        await login();

        let today = new Date()
        let nextWeek = new Date()
        nextWeek.setDate(today.getDate() + 14)
        const activities = await getEvents(today.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0]);

        activities.map(el => {
            if (new RegExp(IMPORTANT_EVENTS_NAMES.join("|")).test(el.title)) {
                el.color = IMPORTANT_EVENT_COLOR_ID;
            } else {
                el.color = undefined;
            }
            el.start = new Date(el.start).toISOString();
            el.end = new Date(el.end).toISOString();

            addEventGC(el, dbo, auth);
        });
    }

    cron.schedule('* * * * *', () => {
        googleAuth(main);
    });
})
