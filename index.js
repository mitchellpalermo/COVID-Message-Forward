require("dotenv").config();
const { google } = require("googleapis");
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.forwardMessage = async (req, res) => {
  console.log("First line of the func");
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheetsClient = google.sheets({ version: "v4", auth });
  console.log("created the google client");

  var valuesToAppend = await getTexts(twilioClient); //getting texts from twilio
  if (valuesToAppend != null) {
    appendValues(sheetsClient, valuesToAppend);
  }
};

async function getTexts(twilioClient) {
  const today = new Date();
  var valuesToAppend = [];
  //getting texts from the last 24 hours
  var messages = await twilioClient.messages.list({
    dateSentAfter: new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    ),
    dateSentBefore: new Date(
      Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        0
      )
    ),
    to: process.env.PHONE_NUMBER,
    limit: 1,
  });

  if (messages.length == 0) {
    console.log("no messages for " + today.getDay());
  } else {
    messages.forEach((m) => {
      var newRow = [m.body, m.from, m.dateSent];
      valuesToAppend.push(newRow);
    });
  }
  return await valuesToAppend;
}

function appendValues(sheetsClient, valuesToAppend) {
  const options = {
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: "Sheet1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: valuesToAppend,
    },
  };
  sheetsClient.spreadsheets.values.append(options, valuesToAppend);
}
