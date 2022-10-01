const nodeFetch = require('node-fetch');
const fetch = require('fetch-cookie')(nodeFetch);
const dotenv = require('dotenv');
dotenv.config();

const AUTO_LOGIN = process.env.AUTO_LOGIN;
const EPITECH_API_CALENDAR = (start, end) => `https://intra.epitech.eu/planning/load?format=json&start=${start}&end=${end}`;


function createHeaders() {
    return {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6",
        "sec-ch-ua":
          '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        cookie: `gdpr=1; user=${AUTO_LOGIN}`,
        "Referrer-Policy": "strict-origin-when-cross-origin",
      }
}

function retrieveEvents(start, end) {
    console.log(EPITECH_API_CALENDAR(start, end));
    return fetch(EPITECH_API_CALENDAR(start, end), {
        headers: createHeaders()
    }).then(res => res.json());
}

async function getEvents(start, end) {
    const activities = await retrieveEvents(start, end);
    console.log(activities)
    if (activities.error) return [];
    const my_activities = activities.filter(el => el.event_registered === 'registered').map(el => {
        var startDate = el.start;
        var endDate = el.end;

        if (el.rdv_group_registered) {
            startDate = el.rdv_group_registered.split('|')[0];
            endDate = el.rdv_group_registered.split('|')[1];
        } else if (el.rdv_indiv_registered) {
            startDate = el.rdv_indiv_registered.split('|')[0];
            endDate = el.rdv_indiv_registered.split('|')[1];
        }

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        startDate.setHours(startDate.getHours() - 2);
        endDate.setHours(endDate.getHours() - 2);

        console.log(el)
        return ({
            title: el.acti_title,
            room: el.room && el.room.code && el.room.code.split('/')[3] || "Not precised",
            start: new Date(startDate),
            end: new Date(endDate),
            rdv_group_registered: el.rdv_group_registered,
            rdv_indiv_registered: el.rdv_indiv_registered,
            codeacti: el.codeacti
        })
    }).sort((ap1, ap2) => {
        if (ap1.start > ap2.start)
            return 1;
        if (ap1.start < ap2.start)
            return -1;
        return 0;
    });
    return my_activities;
}

module.exports = {
    getEvents
}