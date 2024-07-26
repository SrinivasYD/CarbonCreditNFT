const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockAverageEmissionsOracle", function () {
  let MockAverageEmissionsOracle;
  let mockAverageEmissionsOracle;
  let deployer;
  let addr1;

  beforeEach(async function () {
    [deployer, addr1] = await ethers.getSigners();
    MockAverageEmissionsOracle = await ethers.getContractFactory(
      "MockAverageEmissionsOracle"
    );
    mockAverageEmissionsOracle = await MockAverageEmissionsOracle.deploy();
    await mockAverageEmissionsOracle.waitForDeployment();
  });

  it("Should add and remove trusted sources", async function () {
    await mockAverageEmissionsOracle.addTrustedSource(addr1.address);
    expect(await mockAverageEmissionsOracle.trustedSources(addr1.address)).to.be
      .true;

    await mockAverageEmissionsOracle.removeTrustedSource(addr1.address);
    expect(await mockAverageEmissionsOracle.trustedSources(addr1.address)).to.be
      .false;
  });

  it("Should update average emissions factor", async function () {
    await mockAverageEmissionsOracle.addTrustedSource(deployer.address); // Add deployer as trusted source
    await mockAverageEmissionsOracle.updateAverageEmissionsFactor(1500);
    expect(
      await mockAverageEmissionsOracle.getAverageEmissionsFactor()
    ).to.equal(1500);
  });

  it("Should revert if non-trusted source tries to update average emissions factor", async function () {
    // Ensure addr1 is not a trusted source
    await expect(
      mockAverageEmissionsOracle
        .connect(addr1)
        .updateAverageEmissionsFactor(1500)
    ).to.be.revertedWith("Only trusted sources can call this function");
  });

  // Additional test to cover remaining lines and branches
  it("Should revert if non-admin tries to add trusted source", async function () {
    await expect(
      mockAverageEmissionsOracle.connect(addr1).addTrustedSource(addr1.address)
    ).to.be.revertedWith("Only admin can call this function");
  });
});
