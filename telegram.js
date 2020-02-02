if (process.env.NODE_ENV !== 'production') {
  var env = require('node-env-file');
  env(__dirname + '/.env');
}

const request = require('request');

const TelegramBot = require('node-telegram-bot-api');
const telegram = new TelegramBot(process.env.TELEGRAM_API_KEY, {polling: true});

console.log(Object.keys(telegram));

module.exports = {

  init: function () {

    telegram.onText(/^\/suppy/, (msg, match) => {
      const chatId = msg.chat.id;
      const resp = "Current supply of WHACKD"; // the captured "whatever"
      console.log("onText")
      telegram.sendMessage(chatId, resp);
    });

// works in PM's
    telegram.on('message', (msg) => {
      const chatId = msg.chat.id;
      console.log("on Message");
      // send a message to the chat acknowledging receipt of their message
      telegram.sendMessage(chatId, 'Received your message');
    });

    // works in PM's
    // telegram.on("text", (message) => {
    //    let response = "Some Text";
    //    console.log(response);
    //    telegram.sendMessage(message.chat.id, response);
    // });

  },

// error [polling rror]
//   update:function(info){
//     bot.processUpdate(info);
//     console.log("telegram update");
//     console.log(info);
//   }
};

function thisstuff() {
  const api = "https://api.telegram.org/";
  const prefix = "bot";
  const chatroom = "@snowkidsden";
  const response = "I am a tiger";
  const url = api + prefix + process.env.TELEGRAM_API_KEY + "/sendMessage?chat_id=" + chatroom + "&text=" + response;
  console.log(url);

  request(url, function (error, resp) {
    if (error) {
      console.log("Bad Data from Bittrex...");
      callback(error, null);
    } else {
      console.log("responded");
      // console.log(resp);
    }
  });
}