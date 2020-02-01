if (process.env.NODE_ENV !== 'production') {
  var env = require('node-env-file');
  env(__dirname + '/.env');
}

const request = require('request');

const TelegramBot = require('node-telegram-bot-api');
const telegram = new TelegramBot(process.env.TELEGRAM_API_KEY, {polling: true});

module.exports = {

  init: function () {

    telegram.onText(/bodycountbot(.+)/, (msg, match) => {
      const chatId = msg.chat.id;
      const resp = "Current supply of WHACKD"; // the captured "whatever"
      telegram.sendMessage(chatId, resp);
    });

    telegram.on('message', (msg) => {
      const chatId = msg.chat.id;
      console.log("on Message");
      // send a message to the chat acknowledging receipt of their message
      telegram.sendMessage(chatId, 'Received your message');
    });
  }
};

function thisstuff(){
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
};