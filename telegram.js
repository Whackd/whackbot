if (process.env.NODE_ENV !== 'production') {
  const env = require('node-env-file');
  env(__dirname + '/.env');
}

const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const telegram = new TelegramBot(process.env.TELEGRAM_API_KEY, {polling: true});
const decimals = require('./lib/parseDecimal.js');
const mathjs = require('mathjs');
const Web3 = require('web3');
const web3 = new Web3();

module.exports = {

  init: function () {


    telegram.on('message', (msg) => {
      displayStats(msg.chat.id)
    });

    telegram.on('channel_post', (msg) => {

      const chatId = msg.chat.id;

      let query = msg.text.toLowerCase();
      if (query.includes("@whackdbot")) {
        const args = msg.text.split(" ");
        if (args.length > 1) {
          // handle commands
          console.log("commands");
          if (args[1] === 'supply'){
            displayStats(chatId);
          }
          else {
            telegram.sendMessage(chatId, 'Command Not Recognized');
          }
        } else {
          // display help
          displayStats(chatId); // it only does one thing atm
        }
      }
    })
  }
};

function displayStats(chatId){
  let url = "https://api.ethplorer.io/getTokenInfo/0xCF8335727B776d190f9D15a54E6B9B9348439eEE?apiKey=freekey";
  request(url, function (error, resp) {
    if (error) {
      console.log("Bad Data");
      callback(error, null);
      telegram.sendMessage(chatId, error);
    } else {
      let data = JSON.parse(resp.body);
      const nextVictim = (Math.abs(data.transfersCount % 2000 - 2000));
      const s = web3.utils.fromWei(data.totalSupply, 'ether');
      const sR = decimals.round(s, 2);
      const percent = mathjs.evaluate(String(sR) + "/ 1000000000" + " *  " + 100);
      const pR = decimals.round(percent, 2);
      let acc = "WHACKD Details:\n";
      acc += "Supply: " + sR + "\n";
      acc += "Remaining: " + pR + "%\n";
      acc += "Hodlers: " + data.holdersCount + "\n";
      acc += "Approx next victim: " + nextVictim + "\n";
      telegram.sendMessage(chatId, acc);
    }
  });
}

// function thisstuff() {
//   const api = "https://api.telegram.org/";
//   const prefix = "bot";
//   const chatroom = "@snowkidsden";
//   const response = "I am a tiger";
//   const url = api + prefix + process.env.TELEGRAM_API_KEY + "/sendMessage?chat_id=" + chatroom + "&text=" + response;
//   console.log(url);
//
//   request(url, function (error, resp) {
//     if (error) {
//       console.log("Bad Data from Bittrex...");
//       callback(error, null);
//     } else {
//       console.log("responded");
//       // console.log(resp);
//     }
//   });
// }
