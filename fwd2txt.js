require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const voiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();
const port = process.env.PORT || 3000;
// const zenotiNumber = '16264697790';
const squareNumber = '16264697790'; //update this number on 9/30 midnight 


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.all('/answer', (req, res) => {
  const caller = req.body.From;
  //const twilioNumber = req.body.To;
  const twilioNumber = process.env.MSG_SERVICE_ID
  
  sendSms(caller, twilioNumber);

  const r = new voiceResponse();
  r.play({},'https://sepia-cobra-7528.twil.io/assets/text%20sent%20message.mp3');//push this out - 9/26 Great bear cut
  // r.play({},'https://sepia-cobra-7528.twil.io/assets/Gilmore%20Ave%2050.mp3'); OLD F'
  res.send(r.toString());
});

app.all('/forward', (req, res) => {
  const caller = req.body.From;
  //const twilioNumber = req.body.To;
  const twilioNumber = process.env.MSG_SERVICE_ID
  forwardToZenoti(caller, twilioNumber);
  
});


function sendSms(caller, twilioNumber) {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  const message = {
    body: "From Snipits: Book, reschedule, or cancel here: https://bit.ly/booksnipits (account required).Don't reply. Text us at (626) 469-7790 for help",
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
  const regex = /^1(888|866|877|800)/g;

  const message = {
    body: "Cancelation request from customer phonenumber "+caller,
    from: twilioNumber,
    // to: zenotiNumber,
    to: squareNumber,
  };
  console.log({message})
  //add oly forward if it's not 800, 877, 866, 888 numbers or internationnal numbers
  if(twilioNumber.match(regex)){
    return null; 
  }
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

