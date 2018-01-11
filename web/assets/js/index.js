const taskServerUrl = "http://192.168.88.187:8080/nebula-task/task/";

const minimalFee = 2.06;


//
// /**
//  * Event log class, for all events listening
//  * @param result
//  * @constructor
//  */
// function EventLog(result) {
//     this.contractAddress = result.address;
//     this.blockHash = result.blockHash;
//     this.blockNumber = result.blockNumber;
//     this.event = result.event;
//     this.logIndex = result.logIndex;
//     this.transactionHash = result.transactionHash;
//     this.transactionIndex = result.transactionIndex;
//     this.args = result.args;
//     this.removed = result.removed;
// }


/**
 * Temporary solution, this must move to backend
 * @return {*|XML|string|void}
 */
const uuidv4 = function() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    ).replace(/-/g, "");
};

/**
 * TODO 1. the gas here should be a constant value, since it is the same process every time
 * TODO 2. Some of the fee calculation can be done in frontend to save gas fee (safety???)
 * TODO 3. Base fee calculator, should be done somewhere other than in contract
 *
 * This is scratch version of the submit function
 */
let currentOrder = {};

const loadPreTrainedPage = function () {

};

const uploadData = function (callback) {
    //choose file
    //upload
    //show progress
    //display the uploaded uri in data field

};
function Order(uuid, datasetUri, name, script, output, data) {
    this.uuid = uuid;
    this.datasetURI = datasetUri;
    this.name = name;
    this.script = script;
    this.outputURI = output;
    this.data = data;
    this.fee = 2.06;
    this.progress = 0;
    this.status = 0;
    this.transactionHash = "";
}
Order.prototype.setTransactionHash = function (hash) {
    this.transactionHash = hash;
};

const submitOrder = function (callback) {
    let uuid = uuidv4();
    let dataUri = $("#dataUri").val();
    let scriptAddress = $("#script").val();
    let outputAddress = $("#output").val();
    let taskName = $("#taskName").val();
    let data = { "epoch" : $("#epoch").val() };

    currentOrder = new Order(
        uuid,
        dataUri,
        taskName,
        scriptAddress,
        outputAddress,
        data
    );

    $.ajax({
        type: 'POST',
        url: taskServerUrl,
        data: JSON.stringify({
            "uuid": uuid,
            "datasetURI": dataUri,
            "name": taskName,
            "script": scriptAddress,
            "outputURI": outputAddress,
            "data": JSON.stringify(data)
        }),
        dataType: "json",
        contentType: "application/json",
        error: function (e) {
            console.log(e);
        },
        success: function(){
            callback();
        }
    })
};
const attachLink = function (type, hash) {
    $("#payment")
        .append("<div>Task ( " + currentOrder.name + " ) " + type + " ... <div>")
        .append("<div>Transaction Hash: <a href='http://192.168.88.192:8000/#/tx/" + hash +"' target='_blank'>"+hash+"</a></div>");

};

const payToken = function () {
    let fee = parseFloat($("#amount").val());
    if (fee >= minimalFee) {
        currentOrder.fee = web3.toWei(fee, "ether");
        nebulaAi.submitTask(
            currentOrder.uuid,
            {
                value : currentOrder.fee
            },
            function(error, result){
                console.log("error: ",error);
                console.log("result: ",result);
                $("#payment").empty();

                console.log("waiting for submit confirmation");

                let uuidHex = web3.fromAscii(currentOrder.uuid);

                let submitEvent = nebulaAi.taskSubmitted();
                submitEvent.watch(function (error, result) {

                    if(result.args.uuid === uuidHex){
                        submitEvent.stopWatching();
                        console.log("Current Task submitted" , result.args.uuid);
                        console.log("result:" , result);

                        attachLink("receipt", result.transactionHash);

                        let dispatchEvent = nebulaAi.taskDispatched(function (error, result) {

                            if(result.args.uuid === uuidHex){
                                dispatchEvent.stopWatching();
                                console.log("Current Task Dispatched : " , result.args.uuid);
                                console.log("result:" , result);

                                attachLink("dispatched" , result.transactionHash);

                                let completeEvent = nebulaAi.taskCompleted(function (error, result) {

                                    if(result.args.uuid === uuidHex){
                                        completeEvent.stopWatching();
                                        console.log("Current Task Completed : " , result.args.uuid);
                                        console.log("result:" , result);

                                        attachLink("completed" , result.transactionHash);

                                        $("#payment").append("<div>We are going to transfer you to the output page<div>");
                                        setTimeout(function () { window.open("history.html?uuid=" + currentOrder.uuid, "_self"); }, 500);
                                    }else{
                                        console.log("not me yet");
                                    }
                                });
                            }else{
                                console.log("not me yet");
                            }
                        });
                    }else{
                        console.log("not me yet");
                    }
                });
            }
        );
    } else alert("Minimum fee is less than 2.06");

    //window.open("output.html", "_self");
};