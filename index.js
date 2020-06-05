require("dotenv").config();
const { google } = require("googleapis");
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.forwardMessage = async (req, res) => {
  console.log("Forward Messages Triggered");
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheetsClient = google.sheets({ version: "v4", auth });
  console.log("created the google client");

  var valuesToAppend = await getTexts(twilioClient); //getting texts from twilio
  if (valuesToAppend.length > 0) {
    appendValues(sheetsClient, valuesToAppend);
    console.log("Values have been appended");
  } else {
    console.log("no messages from this service");
  }
};

async function getTexts(twilioClient) {
  console.log("TWilio getTexts() triggered");
  const dateOfService = new Date();
  dateOfService.setDate(2);
  dateOfService.setHours(0);
  dateOfService.setMinutes(00);
  console.log("getting messages from " + dateOfService.getDay());
  var valuesToAppend = [];
  //getting texts from the last 24 hours
  var messages = await twilioClient.messages.list({
    dateSent: dateOfService,
    to: process.env.PHONE_NUMBER,
    direction: "inbound",
  });

  if (messages.length == 0) {
    console.log("no messages for " + dateOfService.getDay());
  } else {
    messages.forEach((m) => {
      var newRow = [m.body, m.from, m.dateSent];
      valuesToAppend.push(newRow);
    });
  }
  return await valuesToAppend;
}

function appendValues(sheetsClient, valuesToAppend) {
  console.log("Google Sheets appendValues() triggered");
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
