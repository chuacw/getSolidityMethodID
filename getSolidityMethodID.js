/*
chuacw, Singapore, Singapore
7-8 Feb 2021
*/

var global = (function (g) {
    return g;
})(this);

if (typeof global.web3 == "undefined") {
    // note! without let, or var. Declaring globally
    const Web3 = require("web3");
    global.web3 = new Web3();
    if (typeof global.web3.eth == "undefined") {
        global.web3.eth = require("web3-eth");
        if (typeof global.web3.eth.abi == "undefined") {
            global.web3.eth.abi = require("web3-eth-abi");
        }
    }
    if (typeof global.web3.utils == "undefined") {
        global.web3.utils = require("web3-utils");
    }
}

function strToBytesX(str, n) {
    let result = [];
    for (let i = 0; i < n && i < str.length; ++i) {
        var code = str.charCodeAt(i);
        result = result.concat([code]);
    }
    if (result.length < n) { 
        // pad with prefix 0s
        for (let i = 0; i < n-result.length; i++) {
            result.push(0);
        }
    } 
    return result;    
}

// convert string to bytes3
function bytes3(str) {
    let result = strToBytesX(str, 3);
    return result;    
}

function bytes32(str) {
    let result = strToBytesX(str, 32);
    return result;
}

const keccak256 = global.web3.utils.keccak256; // map the function into a shorter alias

// This function can be used to return the data that is supposed to be placed into 
// msg.data when sent using sendTransaction
function getRawTransactionData(methodName, methodParamTypes, ...methodParams) {
    let rawMethodID;
    if (typeof methodParamTypes == undefined && typeof methodParams == undefined) {
        rawMethodID = keccak256(`${methodName}()`).slice(0, 10);
    } else {
        rawMethodID = keccak256(`${methodName}(${methodParamTypes})`).slice(0, 10);
        let inputs = [], result = rawMethodID;
        let methodParamTypesArray = methodParamTypes.split(",");
        for (let i = 0; i < methodParamTypesArray.length; i++) {
            let paramType = methodParamTypesArray[i];
            let rawParam = web3.eth.abi.encodeParameter(paramType, methodParams[i]);
            let param = rawParam.slice(2);
            result = result + param;
        }
    }
    return result;
}

console.log("Solidity method ID v1.0 Chua Chee Wee (c) 2021");

function showMethodID(funcSig) {
    let arg = funcSig;
    if (arg!="exit" && arg!="quit") { 
        let line = arg.replace(/\s/g, ""); // remove all spaces
        let nameclash = keccak256(`${line}`).slice(0, 10);
        console.log(`Method signature for "${line}" is: ${nameclash}`);   
    }
}

// If app is executed with 
// node getSolidityMethodID.js "burn(uint256)"
// processInfo[0] is full path to node.exe
// processInfo[1] is getSolidityMethodID.js
// cmdlineargs[0] is burn(uint256)
let processInfo = process.argv.slice(0, 2); 
let cmdlineargs = process.argv.slice(2); // skip the first two
if (cmdlineargs.length == 0) {
    const reader = require("readline-sync"); // npm install readline-sync
    let arg = "";
    do {
        arg = reader.question("Method name and param type? ");
        showMethodID(arg);
    } while (arg!="exit" && arg !="quit");
} else {
    for (let arg of cmdlineargs) {
        showMethodID(arg);
    }
}