const nodeFetch = require('node-fetch');
const fetch = require('fetch-cookie')(nodeFetch);
const dotenv = require('dotenv');
dotenv.config();

const AUTO_LOGIN = process.env.AUTO_LOGIN;
const LOGIN_URL = `${AUTO_LOGIN}/user/?format=json`;
const EPITECH_API_CALENDAR = (start, end) => `https://intra.epitech.eu/planning/load?format=json&start=${start}&end=${end}`;


async function login() {
    await fetch(LOGIN_URL);
}

function retrieveEvents(start, end) {
    return fetch(EPITECH_API_CALENDAR(start, end)).then(res => res.json());
}

async function getEvents(start, end) {
    const activities = await retrieveEvents(start, end);
    if (activities.error) return [];
    const my_activities = activities.filter(el => el.event_registered === 'registered').map(el => ({
        title: el.acti_title,
        room: el.room && el.room.code && el.room.code.split('/')[3] || "Not precised",
        start: new Date(el.start),
        end: new Date(el.end)
    })).sort((ap1, ap2) => {
        if (ap1.start > ap2.start)
            return 1;
        if (ap1.start < ap2.start)
            return -1;
        return 0;
    });
    return my_activities;
}

module.exports = {
    login,
    getEvents
}