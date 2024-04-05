const config = require('../config')

const Web3 = require("web3");

var web3 = new Web3(config.TEST_RPC_URL);
var contract_abi = require("../uploads/abi_test_token.json");
var contract_address = config.TEST_CONTRACT_ADDRESS;

const INSTANCE = new web3.eth.Contract(contract_abi, contract_address);

const balanceOf = async (request, response) => {
    var address = request.body.address;

    if (!address) {
        return response.json({
            status: false,
            error: "address parameter missing",
        });
    }

    var isValid = await web3.utils.isAddress(address);
    if (!isValid) {
        return response.json({
            status: false,
            error: "Address Not Valid",
        });
    }

    try {
        var tokenBalance = await INSTANCE.methods.balanceOf(address).call();
        var ETHbalance = await web3.eth.getBalance(address);

        const decimals = await getDecimals();
        if (decimals.status == true) {
            return response.json({
                status: true,
                address: address,
                TOKENbalance: tokenBalance / 10 ** decimals.usdt,
                ETHbalance: ETHbalance / 10 ** decimals.eth,
            });
        } else {
            return response.json({
                status: false,
                error: decimals.error,
            });
        }
    } catch (error) {
        return response.json({
            status: false,
            error: error.message ?? error,
        });
    }
};

async function getDecimals() {
    try {
        var decimals = await INSTANCE.methods.decimals().call();
        response_data = {
            status: true,
            usdt: decimals,
            eth: 18,
        };
    } catch (error) {
        response_data = {
            status: false,
            error: error.message ?? error,
        };
    }
    return response_data;
}

module.exports = {
    balanceOf,
};