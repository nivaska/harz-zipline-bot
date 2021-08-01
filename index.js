const https = require("https");

const url =
  "https://shop.harzdrenalin.de/reservation/calendar/index/eventId/2/";
const freeSlotsColors = ["#198423", "#FFC234"];
const searchDate = "2021-07-25";

exports.handler = async (event) => {
  const promise = new Promise(function (resolve, reject) {
    https
      .get(url, (res) => {
        var body = [];
        res.on("data", function (chunk) {
          body.push(chunk);
        });
        res.on("end", async function () {
          try {
            body = JSON.parse(Buffer.concat(body).toString());
          } catch (e) {
            reject(e);
          }

          const slotsAvailable = checkSlotsAvailable(body);
          await notify(slotsAvailable);
          resolve(true);
        });
      })
      .on("error", (e) => {
        reject(Error(e));
      });
  });
  return promise;
};

const checkSlotsAvailable = (data) => {
  const searchSlots = data["monthly"].filter(
    (e) => e["startdate"] === searchDate
  );
  const freeSlotsAvailable = searchSlots.some((slot) =>
    freeSlotsColors.includes(slot.color)
  );
  return freeSlotsAvailable;
};

const notify = async (slotsAvailable) => {
  if (slotsAvailable) {
    console.log("Free slots available - sending text");
    await sendText(`${getTime()}: Free slots available`);
  } else {
    console.log("Free slots not available");
    if (new Date().getMinutes() < 5 && new Date().getHours() % 2 === 0) {
      console.log("Hourly update - sending text");
      await sendText(`Hourly update: no free slots available`);
    }
  }
};

const sendText = async (message) => {
  return new Promise((resolve, reject) => {
    const accountSid = process.env.ACCOUNT_SID;
    const authToken = process.env.AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);

    client.messages
      .create({
        body: message,
        to: process.env.receiverPhone,
        from: process.env.twilioPhone,
      })
      .then((message) => {
        console.log(`Txt message sent with id ${message.sid}`);
        resolve(true);
      })
      .catch((e) => {
        console.log("Message send failed");
        console.log(Error(e));
        reject();
      });
  });
};

const getTime = () => {
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return date + " " + time;
};
