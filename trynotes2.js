// Create a new directory, install bitcore-explorers, and run the node shell
//mkdir bitcoin && cd bitcoin
//npm install --save bitcore-explorers
//node

// Require the Bitcore libraries into the global namespace
var bitcore = require("bitcore-lib")
bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;
var explo = require("bitcore-explorers")
var shell = {}

//ask customer for pvt key
//var privateKey = new bitcore.PrivateKey('9b1e378e5cf4ac372de363195ee23203b4a6685870a78d68f85d8a6a883c9b5e')
var privateKey = new bitcore.PrivateKey('0189112f36fb5c902ee8eaf48ec95cc2d284e571315a5b4c1f6a501e9c8b37d7')
var addr = privateKey.toAddress()
var publicKey = new bitcore.PublicKey(privateKey)

//set up recovery address and keys 
var recoveryPrivateKey = new bitcore.PrivateKey()
var recoveryPublicKey = new bitcore.PublicKey(recoveryPrivateKey)
var recovery_addr = recoveryPrivateKey.toAddress()
var insight = new explo.Insight()
insight.address(addr, (error, result) => { shell.addr = result })
shell.addr
insight.address(recovery_addr, (error, result) => { shell.raddr = result })
insight.getUnspentUtxos(addr, (error, result) => { shell.utxos = result })
shell.utxos
insight.getUnspentUtxos(recovery_addr, (error, result) => { shell.rutxos = result })

//set up veto address and keys

var vetoPrivateKey = new bitcore.PrivateKey()
var vetoPublicKey = new bitcore.PublicKey(vetoPrivateKey)
var veto_addr = vetoPrivateKey.toAddress()
var insight = new explo.Insight()
insight.address(veto_addr, (error, result) => { shell.vaddr = result })
insight.getUnspentUtxos(veto_addr, (error, result) => { shell.vutxos = result })

//create a multisig address

var pubkeys = [publicKey, recoveryPublicKey, vetoPublicKey]

// if veto is activated, need 2 signatures
var requiredSignatures = 1

var multiSigAddress = new bitcore.Address(pubkeys, requiredSignatures)
var stored_data = "I am stupid"

//now transfer coins and store encrypted pvt key to this msig address 

var tx2msig = new bitcore.Transaction()
tx2msig.from(shell.utxos)
tx2msig.to(multiSigAddress, shell.addr.balance - 50000 )
tx2msig.change(multiSigAddress)
tx2msig.fee(50000)
tx2msig.addData(stored_data)
tx2msig.toObject()
tx2msig.sign(privateKey)
tx2msig.serialize()
insight.broadcast(tx2msig, (error, txId) => { shell.error = error; shell.txId = txId })

//try spending coins from this msig address using private key of recovery address

var unSpentInput = {}
insight.getUnspentUtxos(multiSigAddress, (error, result) => { unSpentInput = result })

insight.address(multiSigAddress, (error, result) => { shell.addr3 = result })

var multiSigTx = new bitcore.Transaction()
multiSigTx.from(unSpentInput, pubkeys, requiredSignatures)
multiSigTx.to(recovery_addr, shell.addr3.balance - 50000)
var feeAmount = bitcore.Unit.fromBTC(0.0005).toSatoshis()
multiSigTx.fee(feeAmount)
multiSigTx.change(recovery_addr)
multiSigTx.sign(recoveryPrivateKey)

//sign with veto key if veto is activated
//multiSigTx.sign(vetoPrivateKey)

multiSigTx.serialize()

insight.broadcast(multiSigTx, (error, txId) => { shell.error = error; shell.txId2 = txId })
