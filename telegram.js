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

      console.log("I was tagged" + now);

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


    telegram.onText(/\/echo (.+)/, (msg, match) => {
      // 'msg' is the received Message from Telegram
      // 'match' is the result of executing the regexp above on the text content
      // of the message

      const chatId = msg.chat.id;
      const resp = match[1]; // the captured "whatever"
      console.log("onText");
      // send back the matched "whatever" to the chat
      telegram.sendMessage(chatId, resp);
    });

    telegram.on('message', (msg) => {
      const chatId = msg.chat.id;
      console.log("on Message")
      // send a message to the chat acknowledging receipt of their message
      telegram.sendMessage(chatId, 'Received your message');
    });


  }
};