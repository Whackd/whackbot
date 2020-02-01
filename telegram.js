if (process.env.NODE_ENV !== 'production') {
  var env = require('node-env-file');
  env(__dirname + '/.env');
}

const TelegramBot = require('node-telegram-bot-api');


const telegram = new TelegramBot(process.env.TELEGRAM_API_KEY, {polling: true});

module.exports = {

  init:function(){
    console.log("Hola")


      // Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
      telegram = new

    telegram.on("text", (message) = > {
      telegram.sendMessage(message.chat.id, "Hello world");
  })
    ;

  }
}