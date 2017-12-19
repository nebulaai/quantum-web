

/**
 * Event log class, for all events listening
 * @param result
 * @constructor
 */
function EventLog(result) {
    this.contractAddress = result.address;
    this.blockHash = result.blockHash;
    this.blockNumber = result.blockNumber;
    this.event = result.event;
    this.logIndex = result.logIndex;
    this.transactionHash = result.transactionHash;
    this.transactionIndex = result.transactionIndex;
    this.args = result.args;
    this.removed = result.removed;
}


if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.88.192:8545"));
}
const abi = (function () {
    let json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "../ABI/NebulaAi1.json",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

NebulaAi = web3.eth.contract(abi);

const contractAddress = "0xfe6d2de6f61cd2a87f45d9076f80a7654f6bb81b";

const nebulaAi = NebulaAi.at(contractAddress);

/**
 * Variables
 */
let userHash;
const submitTaskGas = 300000;
const timeoutLimit = 60000; //1 min
/**
 * Unlock account function for temporary test usage,
 * Account is unlock for 10 min
 */
const login = function () {
    userHash = $("#walletHash").val();
    let result = web3.personal.unlockAccount(userHash, $("#password").val(), timeoutLimit);

    alert(result ? "Login successful" : "Login failed");

};
/**
 * TODO 1. the gas here should be a constant value, since it is the same process every time
 * TODO 2. Some of the fee calculation can be done in frontend to save gas fee (safety???)
 * TODO 3. Base fee calculator, should be done somewhere other than in contract
 *
 * This is scratch version of the submit function
 */
const submitOrder = function() {
    // let addr = $("#dataAddress").val();
    // let scpt = $("#scriptAddress").val();
    // let outp = $("#outputAddress").val();
    // let modr = $("#feeModifier").val();


    let result = nebulaAi.submitTask(addr,scpt,outp, modr, {from: userHash, value: web3.toWei(modr*1.03, "ether") ,gas : submitTaskGas});

    //This gives the hash of the task
    console.log(result);
};


/**
 * This event contains the information about newly submitted tasks
 *
 */
nebulaAi.taskSubmitted().watch(function (error, result) {
    let log = new EventLog(result);
    console.log(log);
});