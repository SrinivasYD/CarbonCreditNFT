const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MockAverageEmissionsOracle
  const MockAverageEmissionsOracle = await ethers.getContractFactory(
    "MockAverageEmissionsOracle"
  );
  const mockAverageEmissionsOracle = await MockAverageEmissionsOracle.deploy();
  await mockAverageEmissionsOracle.waitForDeployment();
  console.log(
    "MockAverageEmissionsOracle deployed to:",
    mockAverageEmissionsOracle.target
  );

  // Deploy MockProjectEmissionsOracle
  const MockProjectEmissionsOracle = await ethers.getContractFactory(
    "MockProjectEmissionsOracle"
  );
  const mockProjectEmissionsOracle = await MockProjectEmissionsOracle.deploy();
  await mockProjectEmissionsOracle.waitForDeployment();
  console.log(
    "MockProjectEmissionsOracle deployed to:",
    mockProjectEmissionsOracle.target
  );

  // Deploy CarbonCreditNFT with the addresses of the deployed oracles
  const CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
  const carbonCreditNFT = await CarbonCreditNFT.deploy(
    mockAverageEmissionsOracle.target,
    mockProjectEmissionsOracle.target
  );
  await carbonCreditNFT.waitForDeployment();
  console.log("CarbonCreditNFT deployed to:", carbonCreditNFT.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
