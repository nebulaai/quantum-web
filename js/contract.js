window.onload = function () {

    var browserChrome = !!window.chrome && !!window.chrome.webstore;
    var browserFirefox = typeof InstallTrigger !== 'undefined';

    if (!browserChrome && !browserFirefox ){
        window.location.href = "./notice/notice_supported/index.html";
    } else if (typeof web3 === 'undefined') {
        window.location.href = "./notice/notice_install/index.html";
        console.log('No web3? You should consider trying MetaMask!')
    } else {
        web3 = new Web3(web3.currentProvider);

        if (web3.eth.defaultAccount === undefined) {
            window.location.href = "./notice/notice_locked/index.html"
            // alert("Please log into your MetaMask account using MetaMask Plugin");
            // Currently only support Chrome with MetaMask plugin installed
            //loginWallet using private key or JSON format
            //
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            // web3 = new Web3(new Web3.providers.HttpProvider("http://18.221.71.211:8545"));
        }else {
            //all good: start app
            loadContract(function () {});
            prepareTaskContract();
        }
    }
};

const contractAddress = "0x45677a1af702817b00858d6a202136ac3cdc4dca"; //Helix v0.2


const loadContract = function(callback) {
    $.ajax({
        url: "http://quantum.nebula-ai.network/assets/ABI/NebulaAi1.json", //production
        // url: "assets/ABI/NebulaAi1.json", // local testing
        dataType: "json",
        error: function (e) {
            console.log("loadContract error: ", e);
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
        url: "http://quantum.nebula-ai.network/assets/ABI/Task_1.json", // production
        // url: "assets/ABI/Task_1.json", // local testing
        dataType: "json",
        error: function (e) {
            console.log("prepareTaskContract error: ", e);
        },
        success: function (data) {
            window.taskContract = web3.eth.contract(data);
        }
    });
};
const loadTaskContract = function(taskAddress){
    window.taskContractInstance = window.taskContract.at(taskAddress);
};
//
// const initiateContract = function (callback) {
//
//     window.addEventListener('load', function () {
//
//         // Checking if Web3 has been injected by the browser (Mist/MetaMask)
//         if (typeof web3 !== 'undefined') {
//             //Currently only support Chrome with MetaMask plugin installed
//             //loginWallet using private key or JSON format
//             web3 = new Web3(web3.currentProvider);
//
//             if (web3.eth.defaultAccount === undefined) {
//                 window.location.href = "./notice/notice_locked/index.html"
//                 // alert("Please log into your MetaMask account using MetaMask Plugin");
//             }
//             callback();
//
//         } else {
//             window.location.href = "./notice/notice_install/index.html"
//             console.log('No web3? You should consider trying MetaMask!')
//             // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
//             web3 = new Web3(new Web3.providers.HttpProvider("http://18.221.71.211:8545"));
//         }
//
//         // // Now you can start your app & access web3 freely:
//         // startApp()
//
//     })
// }
//     // if (typeof web3 !== 'undefined') {
//     //     web3 = new Web3(web3.currentProvider);
//     //     //Currently only support Chrome with MetaMask plugin installed
//     //     //loginWallet using private key or JSON format
//     //
//     //     if (web3.eth.defaultAccount === undefined) {
//     //         alert("Please log into your MetaMask account using MetaMask Plugin");
//     //     }
//     //     callback();
//     //
//     //
//     // } else {
//     //     alert('No web3? You should consider trying MetaMask! Redirecting to loginWallet page...');
//     //     // window.open('need_MetaMask.html', '_self');
//     // }
// };
