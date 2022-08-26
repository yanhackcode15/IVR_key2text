require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const voiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();
const port = process.env.PORT || 3000;
const zenotiNumber = '16264697790';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.all('/answer', (req, res) => {
  const caller = req.body.From;
  const twilioNumber = req.body.To;
  sendSms(caller, twilioNumber);

  const r = new voiceResponse();
  r.play({},'https://sepia-cobra-7528.twil.io/assets/Gilmore%20Ave%2050.mp3');
  res.send(r.toString());
});

app.all('/forward', (req, res) => {
  const caller = req.body.From;
  const twilioNumber = req.body.To;
  forwardToZenoti(caller, twilioNumber);
});


function sendSms(caller, twilioNumber) {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  const message = {
    body: "From Snipits-Pasadena: To book for tomorrow and later: www.calendly.com/snipitspasadena. For today: https://www.snipits.com/location/pasadena. ** Don't reply to this number. Customer service - text us (626)469-7790",
    from: twilioNumber,
    to: caller,
  };
  console.log({message})
  return client.messages.create(message).then()
    .catch(function(error) {
      if (error.code === 21614) {
        console.log("Uh oh, looks like this caller can't receive SMS messages.")
      }
    })
    .done();
}

function forwardToZenoti(caller, twilioNumber){
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  const message = {
    body: "Cancelation request from customer phonenumber "+caller,
    from: twilioNumber,
    to: zenotiNumber,
  };
  console.log({message})
  return client.messages.create(message).then()
    .catch(function(error) {
      if (error.code === 21614) {
        console.log("Uh oh, looks like this caller can't receive SMS messages.")
      }
    })
    .done(); 
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err);
})

// Create an HTTP server and listen for requests on port 3000
console.log('Twilio Client app HTTP server running at https://voice2txt.herokuapp.com/');
app.listen(port);

