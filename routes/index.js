var express = require('express');
var request = require('request');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next)
{
  res.render('index',
  {
    title: 'Express'
  });
});

router.get('/webhook', function(req, res)
{
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === 'access_token')
  {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  }
  else
  {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});


// Listening to webhook
router.post('/webhook', function(req, res)
{
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page')
  {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry)
    {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event)
      {
        // If the received object is Message
        if (event.message)
        {
          // Message with payload
          if (event.message.quick_reply)
          {
            var payload = event.message.quick_reply.payload;
            readPayload(payload, event.sender.id);
          }

          // Normal message
          else
          {
            receivedMessage(event);
          }

          // If the received object is Postback
        }
        else if (event.postback)
        {
          receivedPostback(event);
        }

        // Else..
        else
        {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    res.sendStatus(200);
  }
});


// Reading payloads and acting accordingly
function readPayload(payload, recipientID)
{
  switch (payload)
  {
    case 'RED':
      {
        /* Action codes for colors */
        break;
      }
    case 'ORANGE':
      {

        break;
      }
    case 'SYELLOW':
      {

        break;
      }
    case 'YELLOW':
      {

        break;
      }
    case 'GREEN':
      {

        break;
      }
    case 'TURQUOISE':
      {

        break;
      }
    case 'LBLUE':
      {

        break;
      }
    case 'BLUE':
      {

        break;
      }
    case 'VIOLET':
      {

        break;
      }
    case 'PINK':
      {

        break;
      }
    case 'CH1':
      {
        /* Action codes for channels */
        break;
      }
    case 'CH2':
      {

        break;
      }
    case 'CH3':
      {

        break;
      }
    case 'UP':
      {
        /* Action codes for dimming */
        break;
      }
    case 'DOWN':
      {

        break;
      }
  }

  console.log("Catched payload '%s' from ID %d", payload, recipientID);
}

function receivedMessage(event)
{
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText)
  {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText.toUpperCase())
    {
      case 'OPTIONS':
        sendGenericMessage(senderID);
        break;
      case 'HELP':
        sendTextMessage(senderID, "This bot is part of an under development project. You are not allowed to use it unless authorised otherwise by the developer.\n\n\nIstanbul Bilgi University\nEEEN 2017\n113212007\nmounnem.hor@bilgi.edu.tr");
        break;

      default:
        sendTextMessage(senderID, "Hi! I am your smart home bot. I can help you control things in your living room.");
        sendTextMessage(senderID, "To start type 'Options'. For assisstance type 'Help'.");
        break;
    }
  }
  else if (messageAttachments)
  {
    sendTextMessage(senderID, "Sorry this bot does not handle attachments.");
  }
}

function sendGenericMessage(recipientId)
{
  sendWritingIndicator(recipientId);

  var messageData = {
    recipient:
    {
      id: recipientId
    },
    message:
    {
      attachment:
      {
        type: "template",
        payload:
        {
          template_type: "generic",
          elements: [
          {
            title: "What would you like me to do?",
            subtitle: "Select an option from the list below.",
            image_url: "https://thumb.ibb.co/gSu62a/Untitled_1.png",
            buttons: [
            {
              type: "postback",
              title: "Power Channels",
              payload: "POWER",
            },
            {
              type: "postback",
              title: "Light brightness",
              payload: "DIMMING",
            },
            {
              type: "postback",
              title: "Light color",
              payload: "LIGHT",
            }],
          }]
        }
      }
    }
  };

  removeWritingIndicator(recipientId);
  callSendAPI(messageData);
}

function sendWritingIndicator(recipientId)
{
  var writingBubble = {
    recipient:
    {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  request(
  {
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs:
    {
      access_token: 'EAASbJHRgSZB4BADRm9QluZB3PWhhhlZBWl6S8KA2TIssdM1ZBQm8HFadh6DlRuEGnpvjchxSNHWzm1hy3EvvX3ldr8ZCjb4AM3In164JgBz6jIPJ5sUTnPmMx5gljWT3FBuPQHG5ZBrMCf85ZAa3ZBV02vhZAS6hrqSF3xTGyfTZC4EQZDZD'
    },
    method: 'POST',
    json: writingBubble

  }, function(error, response, body)
  {
    if (!error && response.statusCode == 200)
    {
      var recipientId = body.recipient_id;

      console.log("Successfully sent writing indicator to recipient %s",
        recipientId);
    }
    else
    {
      console.error("Unable to send.");
      console.error(response);
      console.error(error);
    }
  });
}

function removeWritingIndicator(recipientId)
{
  var writingBubble = {
    recipient:
    {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  request(
  {
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs:
    {
      access_token: 'EAASbJHRgSZB4BADRm9QluZB3PWhhhlZBWl6S8KA2TIssdM1ZBQm8HFadh6DlRuEGnpvjchxSNHWzm1hy3EvvX3ldr8ZCjb4AM3In164JgBz6jIPJ5sUTnPmMx5gljWT3FBuPQHG5ZBrMCf85ZAa3ZBV02vhZAS6hrqSF3xTGyfTZC4EQZDZD'
    },
    method: 'POST',
    json: writingBubble

  }, function(error, response, body)
  {
    if (!error && response.statusCode == 200)
    {
      var recipientId = body.recipient_id;

      console.log("Successfully removed writing indicator from recipient %s",
        recipientId);
    }
    else
    {
      console.error("Unable to send.");
      console.error(response);
      console.error(error);
    }
  });
}


function sendTextMessage(recipientId, messageText)
{

  sendWritingIndicator(recipientId);




  var messageData = {
    recipient:
    {
      id: recipientId
    },
    message:
    {
      text: messageText
    },
  };
  callSendAPI(messageData);
  removeWritingIndicator(recipientId);

}

function callSendAPI(messageData)
{
  request(
  {
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs:
    {
      access_token: 'EAASbJHRgSZB4BADRm9QluZB3PWhhhlZBWl6S8KA2TIssdM1ZBQm8HFadh6DlRuEGnpvjchxSNHWzm1hy3EvvX3ldr8ZCjb4AM3In164JgBz6jIPJ5sUTnPmMx5gljWT3FBuPQHG5ZBrMCf85ZAa3ZBV02vhZAS6hrqSF3xTGyfTZC4EQZDZD'
    },
    method: 'POST',
    json: messageData

  }, function(error, response, body)
  {
    if (!error && response.statusCode == 200)
    {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent message with id %s to recipient %s",
        messageId, recipientId);
    }
    else
    {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

function receivedPostback(event)
{
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  if (payload == "POWER")
  {
    console.log("Power payload catched");
    sendPower(senderID);
  }
  else if (payload == "LIGHT")
  {
    console.log("LIGHT payload catched");
    sendLight(senderID);
  }
  else if (payload == "DIMMING")
  {
    console.log("DIMMING payload catched");
    sendDimming(senderID);
  }
}

function sendDimming(recipientId)
{

  sendWritingIndicator(recipientId);

  var messageData = {
    recipient:
    {
      id: recipientId
    },
    message:
    {
      text: "Pick an action",
      quick_replies: [
      {
        content_type: "text",
        title: "Increase brightness",
        payload: "UP",
        image_url: "https://i.imgur.com/E1mYqwP.png"
      },
      {
        content_type: "text",
        title: "Decrease brightness",
        payload: "DOWN",
        image_url: "https://i.imgur.com/2oQHc55.png"
      }]
    }
  };

  removeWritingIndicator(recipientId);
  callSendAPI(messageData);

}

function sendPower(recipientId)
{

  sendWritingIndicator(recipientId);

  var messageData = {
    recipient:
    {
      id: recipientId
    },
    message:
    {
      text: "Pick an action",
      quick_replies: [
      {
        content_type: "text",
        title: "Toggle channel 1",
        payload: "CH1",
        image_url: "https://i.imgur.com/Egj3dTW.png"
      },
      {
        content_type: "text",
        title: "Toggle channel 2",
        payload: "CH2",
        image_url: "https://i.imgur.com/q1hQolN.png"
      },
      {
        content_type: "text",
        title: "Toggle channel 3",
        payload: "CH3",
        image_url: "https://i.imgur.com/Egj3dTW.png"
      }]
    }
  };

  removeWritingIndicator(recipientId);
  callSendAPI(messageData);

}

function sendLight(recipientId)
{

  sendWritingIndicator(recipientId);

  var messageData = {
    recipient:
    {
      id: recipientId
    },
    message:
    {
      text: "Pick a color",
      quick_replies: [
      {
        content_type: "text",
        title: "Red",
        payload: "RED",
        image_url: "https://i.imgur.com/BFBDE8t.png"
      },
      {
        content_type: "text",
        title: "Orange",
        payload: "ORANGE",
        image_url: "https://i.imgur.com/eacuCLm.png"
      },
      {
        content_type: "text",
        title: "Sun yellow",
        payload: "SYELLOW",
        image_url: "https://i.imgur.com/746r4eN.png"
      },
      {
        content_type: "text",
        title: "Yellow",
        payload: "YELLOW",
        image_url: "https://i.imgur.com/tpebGql.png"
      },
      {
        content_type: "text",
        title: "Green",
        payload: "GREEN",
        image_url: "https://i.imgur.com/4kbGf6q.png"
      },
      {
        content_type: "text",
        title: "Turquoise",
        payload: "TURQUOISE",
        image_url: "https://i.imgur.com/jMmKbaC.png"
      },
      {
        content_type: "text",
        title: "Light blue",
        payload: "LBLUE",
        image_url: "https://i.imgur.com/qb4bkZ2.png"
      },
      {
        content_type: "text",
        title: "Blue",
        payload: "BLUE",
        image_url: "https://i.imgur.com/2wi6Hbe.png"
      },
      {
        content_type: "text",
        title: "Violet",
        payload: "VIOLET",
        image_url: "https://i.imgur.com/3QFvAcT.png"
      },
      {
        content_type: "text",
        title: "Pink",
        payload: "PINK",
        image_url: "https://i.imgur.com/pJXrYRe.png"
      }]
    }
  };

  removeWritingIndicator(recipientId);
  callSendAPI(messageData);

}



module.exports = router;
