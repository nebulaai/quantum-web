window.onload = function () {
    // let isChrome = !!window.chrome && !!window.chrome.webstore;

    // if(!isChrome){
    //     window.open("../template/InvalidBrowser.html", "_self");
    // }
};

const contractAddress = "0xe4c0e78969f19b9629662bcd8cf8e1fb1b73d749"; //Helix v0.2


const loadContract = function(callback) {
    $.ajax({
        url: "../assets/ABI/NebulaAi1.json",
        dataType: "json",
        error: function (e) {
            console.log(e);
        },
        success: function (data) {
            let NebulaAi = web3.eth.contract(data);
            window.nebulaAi = NebulaAi.at(contractAddress);
            console.log("current nebula base contract @ ", contractAddress);

            $("#contractReady").show();
            callback();
        }
    })
};
const prepareTaskContract = function(){
    $.ajax({
        url: "../assets/ABI/Task_1.json",
        dataType: "json",
        error: function (e) {
            console.log(e);
        },
        success: function (data) {
            window.taskContract = web3.eth.contract(data);
        }
    });
};
const loadTaskContract = function(taskAddress){
    window.taskContractInstance = window.taskContract.at(taskAddress);
};

const initiateContract = function (callback) {

    window.addEventListener('load', function() {

        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
            //Currently only support Chrome with MetaMask plugin installed
            //loginWallet using private key or JSON format
            web3 = new Web3(web3.currentProvider);

            if (web3.eth.defaultAccount === undefined) {
                alert("Please log into your MetaMask account using MetaMask Plugin");
            }
            callback();

        } else {
            console.log('No web3? You should consider trying MetaMask!')
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            web3 = new Web3(new Web3.providers.HttpProvider("http://ec2-18-221-29-136.us-east-2.compute.amazonaws.com:8545"));
        }

        // // Now you can start your app & access web3 freely:
        // startApp()

    })

    // if (typeof web3 !== 'undefined') {
    //     web3 = new Web3(web3.currentProvider);
    //     //Currently only support Chrome with MetaMask plugin installed
    //     //loginWallet using private key or JSON format
    //
    //     if (web3.eth.defaultAccount === undefined) {
    //         alert("Please log into your MetaMask account using MetaMask Plugin");
    //     }
    //     callback();
    //
    //
    // } else {
    //     alert('No web3? You should consider trying MetaMask! Redirecting to loginWallet page...');
    //     // window.open('need_MetaMask.html', '_self');
    // }
};
