class Contract {

    constructor(web3, name, address, abi_url) {
        this.web3 = web3;
        this.name = name;
        this.contract = {};
        this.instance = {};
        if (typeof address !== 'undefined') {
            this.address = address;
        }
        if (typeof abi_url !== "undefined") {
            this.abi_url = abi_url;
        }
    }

    prepare_contract() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof _this.address === "undefined" || typeof _this.abi_url === "undefined") {
                console.log("Invalid address or abi file path");
                return;
            }
            $.getJSON(_this.abi_url, function (data) {
                _this.contract = _this.web3.eth.contract(data["abi"]);
                _this.instance = _this.contract.at(_this.address);
                console.log(_this.name + " contract @ " + _this.address + " has been loaded");
            }).done(function () {
                resolve();
            }).fail(function () {
                reject();
            })
        });

    }
}

//
// const contractAddress = "0x45677a1af702817b00858d6a202136ac3cdc4dca"; //Helix v0.2
//
//
// const loadContract = function(callback) {
//     $.ajax({
//         url: "http://quantum.nebula-ai.network/assets/ABI/NebulaAi1.json", //production
//         // url: "assets/ABI/NebulaAi1.json", // local testing
//         dataType: "json",
//         error: function (e) {
//             console.log("loadContract error: ", e);
//         },
//         success: function (data) {
//             let NebulaAi = web3.eth.contract(data);
//             window.nebulaAi = NebulaAi.at(contractAddress);
//             console.log("current nebula base contract @ ", contractAddress);
//
//             $("#contractReady").show();
//             callback();
//         }
//     })
// };
//
// const prepareTaskContract = function(){
//     $.ajax({
//         url: "http://quantum.nebula-ai.network/assets/ABI/Task_1.json", // production
//         // url: "assets/ABI/Task_1.json", // local testing
//         dataType: "json",
//         error: function (e) {
//             console.log("prepareTaskContract error: ", e);
//         },
//         success: function (data) {
//             window.taskContract = web3.eth.contract(data);
//         }
//     });
// };
// const loadTaskContract = function(taskAddress){
//     window.taskContractInstance = window.taskContract.at(taskAddress);
// };