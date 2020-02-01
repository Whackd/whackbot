if (process.env.NODE_ENV !== 'production') {
  var env = require('node-env-file');
  env(__dirname + '/.env');
}

const TelegramBot = require('node-telegram-bot-api');
const telegram = new TelegramBot(process.env.TELEGRAM_API_KEY, {polling: true});


module.exports = {

  init:function(){
    console.log("Hola");
    telegram.on("text", function(message) {
      console.log("I am here");
      telegram.sendMessage(message.chat.id, "Sup.");
    });

    telegram.on("inline_query", function(query) {

      // https://core.telegram.org/bots/api#inlinequeryresult
      let now = new Date(2010, 6, 26).getTime();

      console.log("I was tagged");
      telegram.answerInlineQuery(query.id, [
        {
          type: "article",
          id: now,
          title: "WHACKD burn factor:",
          input_message_content: {
            message_text: "This will respond with token information"
          }
        }
      ]);
    });

  }
};