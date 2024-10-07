require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Adjust the runs parameter as needed
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337, // 31337
    },
  },
  paths: {
    artifacts: "./client/src/artifacts",
  },
};
