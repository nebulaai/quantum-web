window.onload = function () {
    let isChrome = !!window.chrome && !!window.chrome.webstore;

    if(!isChrome){
        window.open("../template/InvalidBrowser.html", "_self");
    }
};

const contractAddress = "0xe4c0e78969f19b9629662bcd8cf8e1fb1b73d749"; //Helix v0.2


const loadContract = function() {
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

const initiateContract = function () {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
        //Currently only support Chrome with MetaMask plugin installed
        //loginWallet using private key or JSON format

        if (web3.eth.defaultAccount === undefined) {
            alert("Please log into your MetaMask account using MetaMask Plugin");
        }

        loadContract();
        prepareTaskContract();

    } else {
        alert('No web3? You should consider trying MetaMask! Redirecting to loginWallet page...');
        // window.open('need_MetaMask.html', '_self');
    }
};

initiateContract();