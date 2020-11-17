require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const voiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.all('/answer', (req, res) => {
  const caller = req.body.From;
  const twilioNumber = req.body.To;
  sendSms(caller, twilioNumber);

  const r = new voiceResponse();
  r.say('Our online booking link has been sent. If you are calling from a landline, please hang up and call from a cell phone.');
  res.send(r.toString());
});

function sendSms(caller, twilioNumber) {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  return client.messages.create({
    body: "Book online at www.calendly.com/snipitsmonrovia (showing available slots for tomorrow and after). If you need to book for today, please call our main line. *This number doesn't currently respond to messages. ",
    from: twilioNumber,
    to: caller,
  }).then()
    .catch(function(error) {
      if (error.code === 21614) {
        console.log("Uh oh, looks like this caller can't receive SMS messages.")
      }
    })
    .done();
}



// Create an HTTP server and listen for requests on port 3000
console.log('Twilio Client app HTTP server running at http://127.0.0.1:80');
app.listen(process.env.PORT);

