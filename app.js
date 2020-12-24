'use strict';

const request = require('request');
const express = require('express');
const body_parser = require('body-parser');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = "secretbzz";
const SN_FORMAT_VERIFIER = new RegExp('^[0-9]{6,16}$');

const app = express().use(body_parser.json());

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.post('/webhook', (req, res) => {  

  let body = req.body;

  console.log('POST:');
  console.log(body);

  if (body.object != 'page') {
    res.sendStatus(404);
    return;
  }

  body.entry.forEach(function(entry) {

    let webhook_event = entry.messaging[0];

    if (!webhook_event.message || !webhook_event.message.text) {
      return;
    }

    let sender_psid = webhook_event.sender.id;
    let input = webhook_event.message.text;

    let response;
    if (!SN_FORMAT_VERIFIER.test(input)) {
      response = 'Dzień dobry!\nProszę, podaj mi swój numer karty Beauty ZAZERO.';
    } else if (input == '113192399') {
      response = 'Dziękuję!\nTwoja karta jest ważna do 17.02.2021 i obejmuje usługi:\n - Stylizacja Brwi';
    } else if (input == '113329308') {
      response = 'Dziękuję!\nTwoja karta jest ważna do 31.12.2021 i obejmuje usługi:\n - Paznokcie\n - Stylizacja Rzęs';
    } else if (input == '114945246') {
      response = 'Niestety, Twoja karta straciła ważność 30.11.2020.';
    } else if (input == '114990607') {
      response = 'Niestety, Twoja karta straciła ważność 31.08.2020.';
    } else if (input == '138482385') {
      response = 'Dziękuję!\nTwoja karta jest ważna do 28.06.2021 i obejmuje usługi:\n - Stylizacja Brwi\n - Stylizacja Rzęs';
    } else {
      response = 'Niestety, to nie jest poprawny numer karty. Upewnij się, że przepisałeś wszystkie cyfry znajdujące się pod kodem kreskowym.';
    }

    callSendAPI(sender_psid, {'text': response});
  });

  res.status(200).send('EVENT_RECEIVED');
});

app.get('/webhook', (req, res) => {

  console.log('GET:');
  console.log(req.query);

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  if (!mode || !token) {
    res.sendStatus(400);
    return;
  }
  
  if (mode != 'subscribe' || token != VERIFY_TOKEN) {
    res.sendStatus(403);
    return;
  }

  res.status(200).send(challenge);
});

app.get('/hello', (req, res) => {
  console.log('HELLO:');
  console.log(req);
  res.status(200).send("world");
});

function callSendAPI(sender_psid, response) {

  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  console.log('SENDING...');
  console.log(response);

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('...SUCCESS')
    } else {
      console.error('...ERROR: ' + err);
    }
  }); 
}

