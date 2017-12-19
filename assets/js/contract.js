

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
    web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.88.192:8042"));
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
 * Temporary solution, this must move to backend
 * @return {*|XML|string|void}
 */
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

let currentTransactionHash;
/**
 * TODO 1. the gas here should be a constant value, since it is the same process every time
 * TODO 2. Some of the fee calculation can be done in frontend to save gas fee (safety???)
 * TODO 3. Base fee calculator, should be done somewhere other than in contract
 *
 * This is scratch version of the submit function
 */
const submitOrder = function() {
    let addr = $("#dataUri").val();
    let scpt = $("#script").val();
    let outp = $("#output").val();
    let name = $("#taskName").val();
    let uuid = uuidv4();//This should be moved to backend
    let fee = web3.toWei(parseInt($("#fee").val()), "ether"); // a default value 2.06 is provided

    //TODO get uuid from backend after submitting the following data, for now just keep like this

    //post
    //url: 192.168.88.187:8080/nebula-task/task
    //data :
    // {
    //     "uuid": uuid,
    //     "datasetURI": addr,
    //     "name": name,
    //     "script": scpt,
    //     "outputURI": outp,
    //     "fee": fee
    // }

    //when this is completed

    currentTransactionHash = nebulaAi.submitTask(uuid, {from: userHash, value: fee ,gas : submitTaskGas});

    //This gives the hash of the task
    console.log(currentTransactionHash);
};


/**
 * This event contains the information about newly submitted tasks
 *
 */
nebulaAi.taskSubmitted().watch(function (error, result) {
    let log = new EventLog(result);
    if(result.transactionHash == currentTransactionHash){
        console.log(log);
    }
});