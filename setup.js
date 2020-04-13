const googleAuth = require('./src/google-oauth/google-oauth');

googleAuth((auth) => {
    console.log("Well connected, now once you get the token, add it to the environment variable");
})