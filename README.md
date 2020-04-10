# epi-google-calendar

This program will fill your google calendar with the activities you're registered in the EPITECH calendar.

## Usage

The program will be runned in a docker container and it will be a cronjob that will pass every day at 11:42 PM.
It will be runned alongside the a mongodb instance to save all the already added events and avoid double events.

When the docker will be runned, it will need some data to work:

- Google Calendar API Credentials [follow this tutorial](## How to get your Google API Credentials)
- GOOGLE CALENDAR ID *This is showed in the settings of the calendar you want to fill*
- TIME_ZONE *(default to Europe/Paris)*
- IMPORTANT EVENT COLOR ID [Here you have the different colors IDs](https://lukeboyle.com/blog-posts/2016/04/google-calendar-api---color-id/)
- AUTO LOGIN LINK *(from EPITECH intranet)*

Once all this information is provided, we can run the docker and it will complete your calendar every day with each modification.

To run the docker type in your terminal, at the root of the project: `docker-compose up -d`.
And it will run forever in your computer.

## How to get your Google API Credentials

- Go to [Google APIs Console](https://console.developers.google.com)
- Create a new project
- Click on *Enable API*. Search for the Google Calendar API.
- Create credentials for a *Service account key*.
- Select the option *OAuth Client ID*
- Configure all the requested things that google ask for.
- Then select the option: `Web`
- Then once you set the name, click on *Create credentials*
- Finally when the credentials are created, you have to download them.
- Then rename the the file downloaded to `credentials.json` and place it in the folder `./auth/`


## Contribute

To contribute to the project, you can fork it or create a new issue with your feature.
