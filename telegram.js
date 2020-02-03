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

      const chatId = msg.chat.id;
      let query = msg.text.toLowerCase();
      if (query.includes("@whackdbot")) {
        const args = msg.text.split(" ");
        if (args.length > 1) {
          // handle commands
          if (args[1] === 'supply') {
            displayStats(chatId);
          }
          else if (args[1] === 'btc') {
            bitcoin(chatId);
          }
          else if (args.length === 3){
            pair(chatId, args[1], args[2]);
          }
          else {
            telegram.sendMessage(chatId, 'Command Not Recognized');
          }
        } else {
          // display help
          displayStats(chatId); // it only does one thing atm
        }
      }

    });

    telegram.on('channel_post', (msg) => {

      const chatId = msg.chat.id;
      console.log("case2");

      // let query = msg.text.toLowerCase();
      // if (query.includes("@whackdbot")) {
      //   const args = msg.text.split(" ");
      //   if (args.length > 1) {
      //     // handle commands
      //     console.log("commands");
      //     if (args[1] === 'supply'){
      //       displayStats(chatId);
      //     }
      //     else {
      //       telegram.sendMessage(chatId, 'Command Not Recognized');
      //     }
      //   } else {
      //     // display help
      //     displayStats(chatId); // it only does one thing atm
      //   }
      // }

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

function bitcoin(chatId){

  let url = "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=" + process.env.CRYPTOCOMPARE_API_KEY;
  request(url, function (error, resp) {
    if (error) {
      console.log("Bad Data" + error);
      telegram.sendMessage(chatId, error);
    } else {
      try {
        let btc = resp.body;
        const stupidApi = btc.split(":");
        let acc = "Bitcoin: $";
        acc += stupidApi[1].substring(0, stupidApi[1].length - 1);
        acc += " (cryptocompare)";
        telegram.sendMessage(chatId, acc);
      } catch (e) {

      }
    }
  });
}

function pair(chatId, _from, _to) {

  const from = _from.toUpperCase();
  const to = _to.toUpperCase();

  let url = "https://min-api.cryptocompare.com/data/price?fsym=" + from + "&tsyms=" + to + "&api_key="; // + process.env.CRYPTOCOMPARE_API_KEY;

  request(url, function (error, resp) {
    if (error) {
      console.log("Bad Data" + error);
      telegram.sendMessage(chatId, error);
    } else {
      try {
        let btc = resp.body;
        const stupidApi = btc.split(":");
        let acc = from + "/" + to + ":";
        acc += stupidApi[1].substring(0, stupidApi[1].length - 1);
        acc += " (cryptocompare)";
        console.log(acc);
        // telegram.sendMessage(chatId, acc);
      } catch (e) {
      }
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
