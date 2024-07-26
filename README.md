# CarbonCreditNFT

CarbonCreditNFT is a smart contract system built on Ethereum to issue NFTs representing carbon credits. This system includes a primary contract (`CarbonCreditNFT`) that interacts with two mock oracle contracts (`MockAverageEmissionsOracle` and `MockProjectEmissionsOracle`) to validate carbon emission data and determine eligibility for minting carbon credit NFTs.

## Table of Contents

1. Project Overview
2. Architecture
3. Requirements
4. Installation
5. Deployment
6. Running Tests
7. Security Considerations
8. Attack Vectors Considered
9. Gas Optimization

## Project Overview

The `CarbonCreditNFT` contract allows project owners to register their projects and mint carbon credit NFTs annually, based on verified emissions data. The system ensures that only projects with emissions below the average emissions factor can mint NFTs, incentivizing lower carbon emissions.

## Architecture

1. **CarbonCreditNFT Contract**:

   - Manages the registration of projects and minting of carbon credit NFTs.
   - Interacts with oracle contracts to retrieve emissions data.

2. **MockAverageEmissionsOracle Contract**:

   - Simulates an oracle providing the average emissions factor.

3. **MockProjectEmissionsOracle Contract**:

   - Simulates an oracle providing project-specific emissions data and energy production.

4. **UML Diagram**:

   - The UML diagram is included under the 'docs' folder of the root directory.

## Requirements

- Node.js (v14.x or later)
- Hardhat (latest version)
- Ethereum wallet (e.g., MetaMask)
- Sepolia test network or any Ethereum-compatible blockchain

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

## Deployment

1. Configure Hardhat by creating a hardhat.config.js file if it doesn't exist:

```bash
require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.INFURA_API_KEY,
      accounts: [`0x${process.env.SEPOLIA_PRIVATE_KEY}`],
    },
  },
};
```

2. Create an .env file under root directory to store your environment variables:

```bash
INFURA_API_KEY=your_infura_project_id
SEPOLIA_PRIVATE_KEY=your_private_key
```

3. Deploy the contracts:

```bash
npx hardhat run ignition/modules/deploy.js --network sepolia

```

## Running Tests

```bash
npx hardhat coverage
```

## Security Considerations

1. **Input Validation**:
   - Ensure proper input validation for all user inputs.
2. **Access Control**:
   - Implement strict access control using Ownable and onlyOwner modifiers.
3. **Data Integrity**:
   - Use hashes for large data inputs to prevent excessive gas usage and ensure data integrity.
4. **Pause Functionality**:
   - The contract includes a feature to pause and unpause all functionalities to prevent unwanted actions during an emergency.

## Attack Vectors Considered

1. **Input Manipulation**:
   - Validate and sanitize all inputs to prevent injection attacks.
2. **Oracle Manipulation**:
   - Ensure that only trusted sources can update oracle data.

## Gas Optimization

1. **Efficient Data Structures**:
   - Use mappings and minimal state variables.
2. **Minimize Storage Writes**:
   - Reduce the number of storage writes to save gas.
3. **Batch Operations**:
   - Implement batch operations for repetitive tasks where possible.
