require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.INFURA_API_KEY,
      accounts: [`0x${process.env.SEPOLIA_PRIVATE_KEY}`],
    },
  },
};
