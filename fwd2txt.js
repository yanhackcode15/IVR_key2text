require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const voiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.all('/answer', (req, res) => {
  const caller = req.body.From;
  const twilioNumber = req.body.To;
  sendSms(caller, twilioNumber);

  const r = new voiceResponse();
  // r.say('Our online booking link has been sent. If you are calling from a landline, please hang up and call from a cell phone.');
  r.play({},'https://sepia-cobra-7528.twil.io/assets/online%20booking%20link%20sent.mp3');
  res.send(r.toString());
});

function sendSms(caller, twilioNumber) {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  const message = {
    body: "Book online at www.calendly.com/snipitsmonrovia (showing available slots for tomorrow and after). If you need to book for today, please call our main line. *This number doesn't currently respond to messages. ",
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err);
})

// Create an HTTP server and listen for requests on port 3000
console.log('Twilio Client app HTTP server running at https://voice2txt.herokuapp.com/');
app.listen(port);

