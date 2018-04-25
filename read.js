var express = require("express");
var app = express();
var request = require ("request");

request ({

//	url: "https://blockchain.info/stats?format=json",
	url: "https://testnet.blockchain.info/tx/792b58fffd2dbb4f7232e4ff355fcfb827b9bb25006de7bda9573616ca6a7aa8?format=json",
	json: true
},	function (error, response, body) { 
	retrieve_data = body.out[1].script
//	btcPrice = body.market_price_usd;
//        btcBlocks = body.n_blocks_total;

});


app.get("/", function (req, res) { 
//	res.send("Bitcoin to the moon  ==> " +  btcPrice);
//	res.send("Bitcoin to the moon  ==> " +  retrieve_data);
	res.send("Bitcoin to the moon  ==> " +  Buffer.from(retrieve_data, 'hex').toString('utf8') );

});

app.get ("/block", function (req, res) { 
	res.send("Current block height: " + btcBlocks);
});

app.listen (80, function() { 

console.log("go");

});
