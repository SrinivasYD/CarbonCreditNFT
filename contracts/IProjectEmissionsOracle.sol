// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IProjectEmissionsOracle
 * @dev Interface for interacting with a project emissions oracle.
 */
interface IProjectEmissionsOracle {
    
    /**
     * @notice Registers a new project.
     * @param project The address of the project to be registered.
     */
    function registerProject(address project) external;

    /**
     * @notice Updates the emissions data for a project.
     * @param project The address of the project.
     * @param energyProduced The amount of energy produced by the project.
     * @param emissions The emissions data for the project.
     */
    function updateProjectData(address project, uint256 energyProduced, uint256 emissions) external;

    /**
     * @notice Gets the emissions data for the specified project.
     * @param project The address of the project.
     * @return The emissions data for the project.
     */
    function getProjectEmissionsData(address project) external view returns (uint256);

    /**
     * @notice Gets the energy produced by the specified project.
     * @param project The address of the project.
     * @return The amount of energy produced by the project.
     */
    function getEnergyProduced(address project) external view returns (uint256);
}
