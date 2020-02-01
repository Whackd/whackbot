if (process.env.NODE_ENV !== 'production') {
  var env = require('node-env-file');
  env(__dirname + '/.env');
}

const request = require('request');

const TelegramBot = require('node-telegram-bot-api');
const telegram = new TelegramBot(process.env.TELEGRAM_API_KEY, {polling: true});

module.exports = {

  init: function () {

      telegram.onText(/bodycountbot/, (msg, match) => {
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
}