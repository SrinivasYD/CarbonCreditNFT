// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAverageEmissionsOracle.sol";
import "./IProjectEmissionsOracle.sol";
import "./MockAverageEmissionsOracle.sol";
import "./MockProjectEmissionsOracle.sol";

/**
 * @title CarbonCreditNFT
 * @dev An ERC721 token that represents carbon credits. Tokens are minted based on CO2 reduction calculations.
 */
contract CarbonCreditNFT is ERC721, Pausable, Ownable {
    uint256 public tokenCounter;
    IAverageEmissionsOracle public averageEmissionsOracle;
    IProjectEmissionsOracle public projectEmissionsOracle;

    struct Project {
        address owner;
        string dataHash; // Off-chain data reference
        uint256 lastMintedTimestamp;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCounter;

    /**
     * @dev Emitted when a new project is registered.
     * @param projectId The ID of the registered project.
     * @param owner The address of the project owner.
     * @param dataHash The hash of the off-chain data related to the project.
     */
    event ProjectRegistered(uint256 projectId, address owner, string dataHash);

    /**
     * @dev Emitted when carbon credits are minted.
     * @param projectId The ID of the project for which the credits were minted.
     * @param recipient The address receiving the minted tokens.
     * @param numberOfTokens The number of tokens minted.
     * @param timestamp The timestamp when the tokens were minted.
     */
    event CarbonCreditsMinted(uint256 projectId, address recipient, uint256 numberOfTokens, uint256 timestamp);

    /**
     * @dev Emitted for debugging purposes.
     * @param message The debug message.
     * @param value The associated value.
     */
    event DebugLog(string message, uint256 value);

    /**
     * @dev Constructor for CarbonCreditNFT contract.
     * @param _averageEmissionsOracle The address of the average emissions oracle contract.
     * @param _projectEmissionsOracle The address of the project emissions oracle contract.
     */
    constructor(address _averageEmissionsOracle, address _projectEmissionsOracle)
        ERC721("CarbonCreditNFT", "CCNFT")
        Ownable(msg.sender)
    {
        tokenCounter = 0;
        projectCounter = 0;
        averageEmissionsOracle = IAverageEmissionsOracle(_averageEmissionsOracle);
        projectEmissionsOracle = IProjectEmissionsOracle(_projectEmissionsOracle);
    }

    /**
     * @dev Registers a new project. Only callable when not paused.
     * @param dataHash The hash of the off-chain data related to the project.
     */
    function registerProject(string memory dataHash) public whenNotPaused {
        require(bytes(dataHash).length == 64, "Data hash must be a 64 character hex string");
        projects[projectCounter] = Project({
            owner: msg.sender,
            dataHash: dataHash,
            lastMintedTimestamp: 0
        });
        emit ProjectRegistered(projectCounter, msg.sender, dataHash);
        projectEmissionsOracle.registerProject(msg.sender);
        projectCounter++;
    }

    /**
     * @dev Mints carbon credit tokens for a given project. Only callable by the project owner and when not paused.
     * @param recipient The address receiving the minted tokens.
     * @param projectId The ID of the project for which the tokens are being minted.
     */
    function mintCarbonCredit(address recipient, uint256 projectId) public whenNotPaused {
        Project storage project = projects[projectId];
        require(project.owner == msg.sender, "Only the project owner can mint NFTs");

        uint256 currentTime = block.timestamp;

        if (project.lastMintedTimestamp != 0) {
            require(currentTime >= project.lastMintedTimestamp + 365 days, "NFTs can only be minted annually");
        }

        uint256 energyProduced = projectEmissionsOracle.getEnergyProduced(msg.sender);
        uint256 projectEmissionsData = projectEmissionsOracle.getProjectEmissionsData(msg.sender);
        uint256 averageEmissionsFactor = averageEmissionsOracle.getAverageEmissionsFactor();

        // Debugging logs
        emit DebugLog("During Transaction - Energy Produced", energyProduced);
        emit DebugLog("During Transaction - Project Emissions Data", projectEmissionsData);
        emit DebugLog("During Transaction - Average Emissions Factor", averageEmissionsFactor);

        require(energyProduced > 0, "Energy produced must be greater than zero");
        require(projectEmissionsData < averageEmissionsFactor, "Project emissions are too high!");
        require(averageEmissionsFactor > 0, "The average emissions factor is not updated by the oracle!");

        uint256 co2Reduction = calculateCO2Reduction(energyProduced, averageEmissionsFactor, projectEmissionsData);
        uint256 numberOfTokens = co2Reduction / 1000000; // 1 token per tonne of CO2 (1 tonne = 1,000,000 grams)
        require(numberOfTokens > 0, "No sufficient CO2 reduction for minting NFTs");

        project.lastMintedTimestamp = currentTime;

        for (uint256 i = 0; i < numberOfTokens; i++) {
            _safeMint(recipient, tokenCounter);
            tokenCounter++;
        }

        emit CarbonCreditsMinted(projectId, recipient, numberOfTokens, currentTime);
    }

    /**
     * @dev Calculates the CO2 reduction based on energy produced and emissions data.
     * @param energyProduced The amount of energy produced by the project.
     * @param averageEmissionsFactor The average emissions factor from the oracle.
     * @param projectEmissionsData The emissions data for the project.
     * @return The calculated CO2 reduction in grams.
     */
    function calculateCO2Reduction(
        uint256 energyProduced,
        uint256 averageEmissionsFactor,
        uint256 projectEmissionsData
    ) internal pure returns (uint256) {
        // Calculate the difference in emissions and convert to grams of CO2 avoided
        uint256 avoidedEmissions = energyProduced * (averageEmissionsFactor - projectEmissionsData);
        return avoidedEmissions;
    }

    /**
     * @dev Pauses the contract. Only callable by the owner.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract. Only callable by the owner.
     */
    function unpause() public onlyOwner {
        _unpause();
    }
}
