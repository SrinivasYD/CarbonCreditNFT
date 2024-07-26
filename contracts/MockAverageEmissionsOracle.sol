// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IAverageEmissionsOracle.sol";

/**
 * @title MockAverageEmissionsOracle
 * @dev Mock implementation of the IAverageEmissionsOracle interface for testing purposes.
 */
contract MockAverageEmissionsOracle is IAverageEmissionsOracle {
    address public admin;
    mapping(address => bool) public trustedSources;
    uint256 public averageEmissionsFactor;

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
     * @notice Adds a trusted source that can update the average emissions factor.
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
     * @notice Gets the current average emissions factor.
     * @return The average emissions factor.
     */
    function getAverageEmissionsFactor() external view override returns (uint256) {
        return averageEmissionsFactor;
    }

    /**
     * @notice Updates the average emissions factor. Can only be called by a trusted source.
     * @param emissionsFactor The new average emissions factor to be set.
     */
    function updateAverageEmissionsFactor(uint256 emissionsFactor) external override onlyTrustedSource {
        averageEmissionsFactor = emissionsFactor;
    }
}
