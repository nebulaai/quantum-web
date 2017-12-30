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
    web3 = new Web3(new Web3.providers.HttpProvider( "http://192.168.88.192:8042"));
}
const abi = (function () {
    let json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "assets/ABI/NebulaAi1.json",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

NebulaAi = web3.eth.contract(abi);

const contractAddress = "0xa38effc32e43abe7c5c320899f084338194e4c8b";

const nebulaAi = NebulaAi.at(contractAddress);

/**
 * Variables
 */
let userHash;
const submitTaskGas = 300000;
const timeoutLimit = 60000; //1 min
let currentTransactionHash;
/**
 * Unlock account function for temporary test usage,
 * Account is unlock for 10 min
 */
const login = function () {
    userHash = $("#input-name").val(); console.log(userHash);
    let result = web3.personal.unlockAccount(userHash, $("#input-pass").val(), timeoutLimit);
    if (result) {
        var date = new Date();
        document.cookie = "userHash=" + encodeURIComponent(userHash) + "; expires=" + date.setTime(date.getTime() + timeoutLimit);
        window.open("index.html", "_self");
    } else {
        alert("incorrect wallet or password");
    }
    //console.log(result ? "Login successful" : "Login failed");  
};

/**
 * Temporary solution, this must move to backend
 * @return {*|XML|string|void}
 */
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}


/**
 * TODO 1. the gas here should be a constant value, since it is the same process every time
 * TODO 2. Some of the fee calculation can be done in frontend to save gas fee (safety???)
 * TODO 3. Base fee calculator, should be done somewhere other than in contract
 *
 * This is scratch version of the submit function
 */
let uuid = uuidv4(); uuid = uuid.replace(/-/g, "");
let taskname; 
const submitOrder = function (callback) {
    let addr = $("#dataUri").val();
    let scpt = $("#script").val();
    let outp = $("#output").val();
    taskname= $("#taskName").val();
      //This should be moved to backend
    let fee = web3.toWei(parseInt(/*$("#fee").val()*/ 10), "ether"); // a default value 2.06 is provided

    let url = "http://192.168.88.187:8080/nebula-task/task/"; //debugger;
    /*let postData = {
        "uuid": uuid,
        "datasetURI": addr,
        "name": name,
        "script": scpt,
        "outputURI": outp,
        "fee": fee
    };              

    $.get("http://192.168.88.187:8080/nebula-task/task/56", function(data){
        console.log(data);
    })*/
    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify({
            "uuid": uuid,
            "datasetURI": addr,
            "name": taskname,
            "script": scpt,
            "outputURI": outp,
            "fee": fee
        }),
        dataType: "json",
        contentType: "application/json",
        error: function (e) {
            console.log(e);
        },
        success: function(data){                    console.log("Post result: ", data);
            //userHash = document.cookie.match('(^|;) ?userHash=([^;]*)(;|$)')[2];
            userHash = userHash || "0x28ffd5cd3981f19e6b4256711cb0aa74d5ad3aaf";                                                                  //console.log("userHash", userHash);
            //currentTransactionHash = nebulaAi.submitTask(uuid, { from: userHash, value: fee, gas: submitTaskGas });                               //console.log(currentTransactionHash, "uuid: " + uuid);
            callback();
            //return currentTransactionHash;
        }
    })
    
 
};

