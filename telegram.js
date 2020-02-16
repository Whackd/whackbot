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
const host = "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY;
const web3 = new Web3(new Web3.providers.HttpProvider(host));

let reqs = [];
let count = 0;
let warning = '';

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

async function displayStats(chatId){

  // predict next victim
  // 1. generate an array of requests
  const span = 1000;
  const genesis = 8943162;
  let latest = await web3.eth.getBlockNumber();
  let previous = latest;
  let calls = [];
  reqs = [];
  count = 0;

  while (latest > genesis) {
    previous = latest;
    latest -= span;
    calls.push([latest, previous]);
  }

  for (let i = calls.length - 1; i >= 0; i--) {
    let url = 'https://api.etherscan.io/api?module=logs&action=getLogs&address=';
    url += whackd;
    url += '&fromBlock=' + calls[i][0];
    url += '&toBlock=' + calls[i][1];
    url += '&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    url += '&apikey=' + process.env.ETHERSCAN_API_KEY;
    if (calls[i][0] > 9107357) { // filter out airderps
      reqs.push({from: calls[i][0], to: calls[i][1], url: url});
    }
  }

  // estimated duration
  const duration = (reqs.length * 1.2) / 60; // in minutes
  time(chatId); // begin the onslaught

  // get basic token data
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
      acc += "Calculating next victim, estimated duration: " + duration + " minutes...\n";
      telegram.sendMessage(chatId, acc);
    }
  });
}

function time(chatId) {
  if (reqs.length > 0) {
    getEvents(reqs[reqs.length - 1].from, reqs[reqs.length - 1].to, reqs[reqs.length - 1].url, function (error, found) {
      if (error){
        console.log("An error has occured. " + error)

      } else {
        reqs.pop();
        if (found === 1) {
          // secondary response
          let acc = "";
          acc += "There have been " + count + " transactions since last burn.\n";
          acc += "Every token move causes 2 transactions, one to receiver, one to burn address.\n";
          acc += "Estimated " + (1000 - (count / 2)) + " token moves until next burn.\n";
          telegram.sendMessage(chatId, acc);

        } else {
          time(chatId);
        }
      }
    });
  }
}

function getEvents(from, to, url, cb) {
  request(url, function (error, resp) {
    if (error) {
      cb(error, null);
      telegram.sendMessage(chatId, error);
    } else {
      let data = JSON.parse(resp.body).result;
      let found = 0;
      let foundIndex = 0;
      let newEntries = 0;
      for (let i = 0; i < data.length; i++) {
        // console.log(data[i]['blockNumber'] + ": " + data[i]['transactionHash'] + " " + data[i]['data'])

        if (Number(data[i]['data']) === 0x0000000000000000000000000000000000000000000000000000000000000000) {
          // console.log('found! ' + data[i]['transactionHash']);
          found += 1;
          foundIndex = i;
        }
      }

      if (found === 1) {
        newEntries = data.length - foundIndex;
        // console.log("foundIndex: " + foundIndex);
        // console.log("query entries: " + data.length);
        // console.log("length minus index: " + newEntries)

      } else if (found > 1) {
        console.log("ignoring double entry")
      }
      if (newEntries === 0) {
        newEntries = data.length;
      }

      if (data.length > 999) {
        warning = "Too many transactions in a short period of time, increase in the degree of error in prediction in block range: " + from + " " + to;
      }
      count += newEntries;
      console.log("array: " + data.length + " new: " + newEntries + " ongoing: " + count + " estimated: " + count / 2);
      cb(null, found);
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
        let acc = from + "/" + to + ": ";
        acc += stupidApi[1].substring(0, stupidApi[1].length - 1);
        acc += " (cryptocompare)";
        console.log(acc);
        telegram.sendMessage(chatId, acc);
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
