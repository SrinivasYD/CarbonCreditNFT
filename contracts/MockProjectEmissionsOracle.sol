// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IProjectEmissionsOracle.sol";

/**
 * @title MockProjectEmissionsOracle
 * @dev Mock implementation of the IProjectEmissionsOracle interface for testing purposes.
 */
contract MockProjectEmissionsOracle is IProjectEmissionsOracle {
    address public admin;
    mapping(address => bool) public trustedSources;
    mapping(address => bool) public registeredProjects;
    mapping(address => uint256) public energyProducedData;
    mapping(address => uint256) public projectEmissionsData;

    /**
     * @dev Modifier to allow only the admin to call a function.
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    /**
     * @dev Modifier to allow only trusted sources to call a function.
     */
    modifier onlyTrustedSource() {
        require(trustedSources[msg.sender], "Only trusted sources can call this function");
        _;
    }

    /**
     * @dev Constructor that sets the deployer as the admin.
     */
    constructor() {
        admin = msg.sender;
    }

    /**
     * @notice Adds a trusted source that can update project data.
     * @param source The address to be added as a trusted source.
     */
    function addTrustedSource(address source) external onlyAdmin {
        trustedSources[source] = true;
    }

    /**
     * @notice Removes a trusted source.
     * @param source The address to be removed from trusted sources.
     */
    function removeTrustedSource(address source) external onlyAdmin {
        trustedSources[source] = false;
    }

    /**
     * @notice Registers a new project.
     * @param project The address of the project to be registered.
     */
    function registerProject(address project) external {
        registeredProjects[project] = true;
    }

    /**
     * @notice Updates the emissions data and energy produced data for a project. Can only be called by a trusted source.
     * @param project The address of the project.
     * @param energyProduced The amount of energy produced by the project.
     * @param emissions The emissions data for the project.
     */
    function updateProjectData(address project, uint256 energyProduced, uint256 emissions) external onlyTrustedSource {
        require(registeredProjects[project], "Project not registered");
        energyProducedData[project] = energyProduced;
        projectEmissionsData[project] = emissions;
    }

    /**
     * @notice Gets the emissions data for the specified project.
     * @param project The address of the project.
     * @return The emissions data for the project.
     */
    function getProjectEmissionsData(address project) external view override returns (uint256) {
        require(registeredProjects[project], "Project not registered");
        return projectEmissionsData[project];
    }

    /**
     * @notice Gets the energy produced by the specified project.
     * @param project The address of the project.
     * @return The amount of energy produced by the project.
     */
    function getEnergyProduced(address project) external view override returns (uint256) {
        require(registeredProjects[project], "Project not registered");
        return energyProducedData[project];
    }
}
