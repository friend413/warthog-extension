import elliptic from 'elliptic';
// const crypto = require('node:crypto');
const ec = new elliptic.ec('secp256k1');
import crypto from 'node:crypto';
import CryptoJS from 'crypto-js';

//////////////////////////////
// Handling wallets
//////////////////////////////


// generate private key
var pk = ec.genKeyPair()

// alternatively read private key
var pkhex= '8b3ec81d4f0b865c61373aea6c0add61ffb6c7b52fe27ab01b98667fa4b9f8e'
var pk =  ec.keyFromPrivate(pkhex);

// convert private key to hex
pkhex = pk.getPrivate().toString("hex")
while (pkhex.length < 64) {
  pkhex = "0" + pkhex;
}

// print private key:
console.log("private key:", pkhex)

// derive public key
var pubKey = pk.getPublic().encodeCompressed("hex");

// print public key
console.log("public key:", pubKey)

// convert public key to raw addresss
var sha = crypto.createHash('sha256').update(Buffer.from(pubKey,"hex")).digest()
var addrRaw = crypto.createHash('ripemd160').update(sha).digest()

// generate address by appending checksum
var checksum = crypto.createHash('sha256').update(addrRaw).digest().slice(0,4)
console.log("sha", sha.toString("hex"))
console.log("addrRaw", addrRaw.toString("hex"))
console.log("checksum", checksum.toString("hex"))
var addr = Buffer.concat([addrRaw , checksum]).toString("hex")

// print address
console.log("address:", addr)
