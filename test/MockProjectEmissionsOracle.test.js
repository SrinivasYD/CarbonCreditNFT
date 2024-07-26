const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockProjectEmissionsOracle", function () {
  let MockProjectEmissionsOracle;
  let mockProjectEmissionsOracle;
  let deployer;
  let addr1;

  beforeEach(async function () {
    [deployer, addr1] = await ethers.getSigners();
    MockProjectEmissionsOracle = await ethers.getContractFactory(
      "MockProjectEmissionsOracle"
    );
    mockProjectEmissionsOracle = await MockProjectEmissionsOracle.deploy();
    await mockProjectEmissionsOracle.waitForDeployment();
  });

  it("Should add and remove trusted sources", async function () {
    await mockProjectEmissionsOracle.addTrustedSource(addr1.address);
    expect(await mockProjectEmissionsOracle.trustedSources(addr1.address)).to.be
      .true;

    await mockProjectEmissionsOracle.removeTrustedSource(addr1.address);
    expect(await mockProjectEmissionsOracle.trustedSources(addr1.address)).to.be
      .false;
  });

  it("Should register and update project data", async function () {
    await mockProjectEmissionsOracle.addTrustedSource(deployer.address); // Add deployer as trusted source
    await mockProjectEmissionsOracle.registerProject(addr1.address);
    expect(await mockProjectEmissionsOracle.registeredProjects(addr1.address))
      .to.be.true;

    await mockProjectEmissionsOracle.updateProjectData(
      addr1.address,
      2000,
      500
    );
    expect(
      await mockProjectEmissionsOracle.getEnergyProduced(addr1.address)
    ).to.equal(2000);
    expect(
      await mockProjectEmissionsOracle.getProjectEmissionsData(addr1.address)
    ).to.equal(500);
  });

  it("Should revert if non-trusted source tries to update project data", async function () {
    await mockProjectEmissionsOracle.registerProject(addr1.address); // Ensure project is registered
    await expect(
      mockProjectEmissionsOracle
        .connect(addr1)
        .updateProjectData(addr1.address, 2000, 500)
    ).to.be.revertedWith("Only trusted sources can call this function");
  });

  // Additional test to cover remaining lines and branches
  it("Should revert if non-admin tries to add trusted source", async function () {
    await expect(
      mockProjectEmissionsOracle.connect(addr1).addTrustedSource(addr1.address)
    ).to.be.revertedWith("Only admin can call this function");
  });
});
