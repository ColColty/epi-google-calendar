# epi-google-calendar

This program will fill your google calendar with the activities you're registered in the EPITECH calendar.

## Usage

The program will be runned in a docker container and it will be a cronjob that will pass every day at 1:45 AM.
It will be runned alongside the a mongodb instance to save all the already added events and avoid double events.

When the docker will be runned, it will need some data to work:

- Google Calendar API Credentials
- GOOGLE CALENDAR ID
- TIME_ZONE (default to Europe/Paris)
- IMPORTANT EVENT COLOR ID
- AUTO LOGIN LINK (from EPITECH intra)

Once all this information is provided, we can run the docker and it will complete your calendar every day with each modification.