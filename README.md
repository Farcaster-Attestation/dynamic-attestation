# Dynamic Attestation MVP

## Overview

Dynamic Attestation is an implementation that utilizes the Ethereum Attestation Service (EAS) for issuing attestations to the top 100 delegates in Optimism's governance system.

## Key Features

- **Daily Delegate Tracking**: Automatically checks and updates the current top 100 delegates
- **Attestation Management**:
  - Revokes attestations for delegates who fall out of the top 100
  - Issues new attestations for delegates entering the top 100

## Current Implementation

This is a Minimum Viable Product (MVP) that leverages the existing Curia infrastructure to:

- Demonstrate the dynamic attestation feature in practice
- Gather initial feedback for future improvements

The current version serves as a proof of concept and deployed to Cloudrun with daily Cloud Scheduler trigger. A more comprehensive implementation is planned, with detailed specifications to be outlined in this [architecture doc](docs/design.md)

### Components

- **labeler**: The Python project retrieves delegates data and checks for the current top 100 delegates. It generates a list of attestations that need to be revoked or issued for the attestor components. Note that this version still utilizes the Curia infrastructure and will need to rely on more open-source and decentralized solutions in the next version.
- **attestor**: The NestJS project retrieves the attestations list generated by the labeler component and integrates with the Ethereum Attestation Service (EAS) to revoke and issue on-chain attestations.
- **contracts**: Provide an EAS resolver contract that will check that only authorized issuers can issue the attestations.
- **subgraph**: The subgraph indexes about delegation event from OP contract and subdelegation from Alligator contract. This subgraph is also have daily snapshot of latest change on direct delegation for each delegates.

## Deployments

### Contracts

#### Curia Resolver

| Network    | Contract Address                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| OP         | [0x04bD1FBBc9691dB0B239175dcB61Fd37AF0A3403](https://optimistic.etherscan.io/address/0x04bD1FBBc9691dB0B239175dcB61Fd37AF0A3403)       |
| OP-Sepolia | [0x31916063C2A7D522B16d9c84F94Da93eADb41238](https://sepolia-optimism.etherscan.io/address/0x31916063c2a7d522b16d9c84f94da93eadb41238) |

### EAS Schema Id

| Network    | EAS Schema Id Address                                                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OP         | [0xcc51e24772be5054d0792c798e1a3dd80be559598f7d5400e11f24e4a6a0e49c](https://optimism.easscan.org/schema/view/0xcc51e24772be5054d0792c798e1a3dd80be559598f7d5400e11f24e4a6a0e49c)         |
| OP-Sepolia | [0xbc758ef858ac3c4a31f01d9b81154c262080c0d0293ccbb79c3432d2e2d1255c](https://optimism-sepolia.easscan.org/schema/view/0xbc758ef858ac3c4a31f01d9b81154c262080c0d0293ccbb79c3432d2e2d1255c) |

### Subgraph

The subgraph is deployed to [3My6Lts1ewYY8Ncco3pRCxnkUispuKp7bkyLVme14Tde](https://thegraph.com/explorer/subgraphs/3My6Lts1ewYY8Ncco3pRCxnkUispuKp7bkyLVme14Tde?view=Query&chain=arbitrum-one)

## Integration

The integration guide will be in this [integration document](docs/integration.md).
