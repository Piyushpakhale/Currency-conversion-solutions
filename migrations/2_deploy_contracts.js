const CryptoDebitCard = artifacts.require("CryptoDebitCard");

module.exports = async function (deployer, network, accounts) {
  const bankAddress = accounts[1]; // Using 2nd Ganache account as bank
  const initialFiatReserve = 10000000000000; // Adjust as needed

  await deployer.deploy(CryptoDebitCard, bankAddress, initialFiatReserve);
};
