const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCreditNFT", function () {
  let CarbonCreditNFT;
  let carbonCreditNFT;
  let deployer;
  let addr1;
  let addr2;
  let mockAverageEmissionsOracle;
  let mockProjectEmissionsOracle;

  beforeEach(async function () {
    [deployer, addr1, addr2] = await ethers.getSigners();

    const dataHash = "a".repeat(64);

    const MockAverageEmissionsOracle = await ethers.getContractFactory(
      "MockAverageEmissionsOracle"
    );
    mockAverageEmissionsOracle = await MockAverageEmissionsOracle.deploy();
    await mockAverageEmissionsOracle.waitForDeployment();

    const MockProjectEmissionsOracle = await ethers.getContractFactory(
      "MockProjectEmissionsOracle"
    );
    mockProjectEmissionsOracle = await MockProjectEmissionsOracle.deploy();
    await mockProjectEmissionsOracle.waitForDeployment();

    CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
    carbonCreditNFT = await CarbonCreditNFT.deploy(
      mockAverageEmissionsOracle.target,
      mockProjectEmissionsOracle.target
    );
    await carbonCreditNFT.waitForDeployment();

    // Deployer adds itself as a trusted source
    await mockAverageEmissionsOracle.addTrustedSource(deployer.address);
    await mockProjectEmissionsOracle.addTrustedSource(deployer.address);

    // Update emissions factor
    await mockAverageEmissionsOracle.updateAverageEmissionsFactor(1000);

    // Register project in CarbonCreditNFT contract
    await carbonCreditNFT.connect(addr1).registerProject(dataHash);

    // Use project address to update project data in MockProjectEmissionsOracle
    await mockProjectEmissionsOracle.registerProject(addr1.address);
    await mockProjectEmissionsOracle.updateProjectData(
      addr1.address,
      2000,
      500
    ); // Ensure sufficient CO2 reduction

    // Verify data is correctly set up
    expect(
      await mockProjectEmissionsOracle.getEnergyProduced(addr1.address)
    ).to.equal(2000);
    expect(
      await mockProjectEmissionsOracle.getProjectEmissionsData(addr1.address)
    ).to.equal(500);
    expect(
      await mockAverageEmissionsOracle.getAverageEmissionsFactor()
    ).to.equal(1000);

    // Logging to check if data is populated correctly
    const energyProduced = await mockProjectEmissionsOracle.getEnergyProduced(
      addr1.address
    );
    const projectEmissionsData =
      await mockProjectEmissionsOracle.getProjectEmissionsData(addr1.address);
    const averageEmissionsFactor =
      await mockAverageEmissionsOracle.getAverageEmissionsFactor();
    console.log(
      `Setup - Average Emissions Factor: ${averageEmissionsFactor.toString()}`
    );
    console.log(`Setup - Energy Produced: ${energyProduced.toString()}`);
    console.log(
      `Setup - Project Emissions Data: ${projectEmissionsData.toString()}`
    );
  });

  it("Should deploy and set initial values correctly", async function () {
    expect(await carbonCreditNFT.name()).to.equal("CarbonCreditNFT");
    expect(await carbonCreditNFT.symbol()).to.equal("CCNFT");
  });

  it("Should register a project with valid data hash", async function () {
    const dataHash = "a".repeat(64); // 64 character hex string
    await carbonCreditNFT.connect(addr1).registerProject(dataHash);
    const project = await carbonCreditNFT.projects(0);
    expect(project.owner).to.equal(addr1.address);
  });

  it("Should revert if data hash is not 64 characters", async function () {
    const invalidDataHash = "a".repeat(63); // 63 character string
    await expect(
      carbonCreditNFT.connect(addr1).registerProject(invalidDataHash)
    ).to.be.revertedWith("Data hash must be a 64 character hex string");
  });

  it("Should mint NFTs for a project", async function () {
    // Re-log the values before minting
    const energyProduced = await mockProjectEmissionsOracle.getEnergyProduced(
      addr1.address
    );
    const projectEmissionsData =
      await mockProjectEmissionsOracle.getProjectEmissionsData(addr1.address);
    const averageEmissionsFactor =
      await mockAverageEmissionsOracle.getAverageEmissionsFactor();
    console.log(
      `Mint - Average Emissions Factor: ${averageEmissionsFactor.toString()}`
    );
    console.log(`Mint - Energy Produced: ${energyProduced.toString()}`);
    console.log(
      `Mint - Project Emissions Data: ${projectEmissionsData.toString()}`
    );

    const tx = await carbonCreditNFT
      .connect(addr1)
      .mintCarbonCredit(addr1.address, 0);

    const receipt = await tx.wait();
    const debugLogs = receipt.events
      ? receipt.events.filter((x) => x.event === "DebugLog")
      : [];
    for (const log of debugLogs) {
      console.log(log.args.message, log.args.value.toString());
    }

    expect(await carbonCreditNFT.balanceOf(addr1.address)).to.equal(1); // 1 token expected
  });

  it("Should retrieve oracle data directly", async function () {
    // Directly retrieve oracle data for addr1
    const energyProduced = await mockProjectEmissionsOracle.getEnergyProduced(
      addr1.address
    );
    const projectEmissionsData =
      await mockProjectEmissionsOracle.getProjectEmissionsData(addr1.address);
    const averageEmissionsFactor =
      await mockAverageEmissionsOracle.getAverageEmissionsFactor();

    // Log retrieved data
    console.log(
      `Direct Retrieval - Energy Produced: ${energyProduced.toString()}`
    );
    console.log(
      `Direct Retrieval - Project Emissions Data: ${projectEmissionsData.toString()}`
    );
    console.log(
      `Direct Retrieval - Average Emissions Factor: ${averageEmissionsFactor.toString()}`
    );

    // Assertions to verify correct data
    expect(energyProduced).to.equal(2000);
    expect(projectEmissionsData).to.equal(500);
    expect(averageEmissionsFactor).to.equal(1000);
  });

  it("Should emit ProjectRegistered event", async function () {
    const dataHash = "a".repeat(64);
    await expect(carbonCreditNFT.connect(addr1).registerProject(dataHash))
      .to.emit(carbonCreditNFT, "ProjectRegistered")
      .withArgs(1, addr1.address, dataHash); // Correct project ID (1)
  });

  it("Should emit CarbonCreditsMinted event", async function () {
    const tx = await carbonCreditNFT
      .connect(addr1)
      .mintCarbonCredit(addr1.address, 0);
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);

    const debugLogs = receipt.events
      ? receipt.events.filter((x) => x.event === "DebugLog")
      : [];
    for (const log of debugLogs) {
      console.log(log.args.message, log.args.value.toString());
    }

    await expect(tx)
      .to.emit(carbonCreditNFT, "CarbonCreditsMinted")
      .withArgs(0, addr1.address, 1, block.timestamp); // Correct number of tokens (1)
  });

  it("Should pause and unpause the contract", async function () {
    const dataHash = "a".repeat(64);
    await expect(carbonCreditNFT.pause())
      .to.emit(carbonCreditNFT, "Paused")
      .withArgs(deployer.address);

    await expect(
      carbonCreditNFT.connect(addr1).registerProject(dataHash)
    ).to.be.revertedWithCustomError(carbonCreditNFT, "EnforcedPause");

    await expect(carbonCreditNFT.unpause())
      .to.emit(carbonCreditNFT, "Unpaused")
      .withArgs(deployer.address);

    await carbonCreditNFT.connect(addr1).registerProject(dataHash);
    const project = await carbonCreditNFT.projects(0);
    expect(project.owner).to.equal(addr1.address);
  });

  // Additional tests for edge cases
  it("Should not mint NFTs if project emissions data is too high", async function () {
    await mockProjectEmissionsOracle.updateProjectData(
      addr1.address,
      1000,
      1500
    ); // High project emissions data

    await expect(
      carbonCreditNFT.connect(addr1).mintCarbonCredit(addr1.address, 0)
    ).to.be.revertedWith("Project emissions are too high!");
  });

  it("Should not mint NFTs if energy produced is zero", async function () {
    await mockProjectEmissionsOracle.updateProjectData(addr1.address, 0, 500); // Zero energy produced

    await expect(
      carbonCreditNFT.connect(addr1).mintCarbonCredit(addr1.address, 0)
    ).to.be.revertedWith("Energy produced must be greater than zero");
  });

  it("Should not mint NFTs if average emissions factor is zero", async function () {
    await mockAverageEmissionsOracle.updateAverageEmissionsFactor(0);

    await expect(
      carbonCreditNFT.connect(addr1).mintCarbonCredit(addr1.address, 0)
    ).to.be.revertedWith("Project emissions are too high!"); // Adjusted expected error message
  });

  // New tests to cover remaining lines and branches
  it("Should revert minting if no sufficient CO2 reduction", async function () {
    await mockProjectEmissionsOracle.updateProjectData(addr1.address, 500, 499); // Insufficient CO2 reduction

    await expect(
      carbonCreditNFT.connect(addr1).mintCarbonCredit(addr1.address, 0)
    ).to.be.revertedWith("No sufficient CO2 reduction for minting NFTs");
  });

  it("Should revert pause if already paused", async function () {
    await carbonCreditNFT.pause();
    await expect(carbonCreditNFT.pause()).to.be.revertedWithCustomError(
      carbonCreditNFT,
      "EnforcedPause"
    );
  });

  it("Should revert unpause if not paused", async function () {
    await expect(carbonCreditNFT.unpause()).to.be.revertedWithCustomError(
      carbonCreditNFT,
      "ExpectedPause"
    );
  });
});
