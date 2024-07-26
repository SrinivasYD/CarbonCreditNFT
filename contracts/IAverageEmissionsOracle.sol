// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAverageEmissionsOracle
 * @dev Interface for interacting with an average emissions oracle.
 */
interface IAverageEmissionsOracle {
    
    /**
     * @notice Gets the current average emissions factor.
     * @return The average emissions factor.
     */
    function getAverageEmissionsFactor() external view returns (uint256);

    /**
     * @notice Updates the average emissions factor.
     * @param emissionsFactor The new average emissions factor to be set.
     */
    function updateAverageEmissionsFactor(uint256 emissionsFactor) external;
}
