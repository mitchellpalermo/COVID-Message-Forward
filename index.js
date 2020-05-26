require("dotenv").config();
const { google } = require("googleapis");
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const googleClient = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

exports.forwardMessage = (req, res) => {
  console.log("first line down");
  googleClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("inside the else about to run the appendFunction");
      sheetsAppend(googleClient); //if auth works, run the append function
    }
  });
};

function sheetsAppend(client) {
  console.log("made it inside the append function");
  const sheetsClient = google.sheets({ version: "v4", auth: client });

  const today = new Date();

  twilioClient.messages
    .list({
      dateSentAfter: new Date(
        Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0
        )
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
    })
    .then((messages) => {
      console.log("we made it here");
      if (messages.length == 0) {
        console.log(
          "no messages for " +
            today.getFullYear +
            "," +
            today.getMonth +
            "," +
            today.getDate +
            "," +
            today.getMonth +
            "," +
            today.getDay
        );
      } else {
        var valuesToAppend = [];

        messages.forEach((m) => {
          var newRow = [m.body, m.from, m.dateSent];
          console.log(newRow);
          valuesToAppend.push(newRow);
        });
      }

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
    });
}
