const hre = require("hardhat");

async function main() {
  const Df = await hre.ethers.getContractFactory("DigitalForensics");
  const df = await Df.deploy();

  await df.waitForDeployment();

  console.log("Library deployed to:", await df.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
