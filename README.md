# COVID Message Foward

### Tracking attendance using Twilio SMS + Google Sheets

This small function is responsible for fetching messages from the Twilio API and appending them to a Google Sheet.

The purpose of this project is to allow us to contact people who may have attended a church service along with someone who has tested positive for COVID-19. By sending a text to our Twilio phone number, people can record their attendance and allow us a simple database of who attended service on a given date.

This function is deployed as a Google Clound Function that is set to run each time we have a service.
