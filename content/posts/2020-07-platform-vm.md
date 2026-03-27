---
title: "Platform VM: The Foundation Layer"
date: 2020-07-08T11:00:00-08:00
draft: false
author: "Zach Kelling"
tags: ["platform", "vm", "architecture", "technical"]
categories: ["Technical"]
description: "Introducing the Platform VM, the coordination layer that manages validators, staking, and subnet creation on Lux Network."
---

With Wave consensus proven and tested, we now reveal the architectural foundation that enables Lux Network's multi-chain vision: the **Platform VM**.

## Architecture Overview

Lux Network is not a single blockchain. It is a platform for creating and coordinating multiple interoperable blockchains. At the center sits the Platform Chain (P-Chain), running the Platform VM.

```
┌─────────────────────────────────────────────────┐
│                  Lux Network                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │  X-Chain  │  │  C-Chain  │  │  Subnets  │   │
│  │   (AVM)   │  │   (EVM)   │  │ (Custom)  │   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘   │
│        │              │              │          │
│        └──────────────┼──────────────┘          │
│                       │                         │
│              ┌────────┴────────┐                │
│              │    P-Chain      │                │
│              │  (Platform VM)  │                │
│              └─────────────────┘                │
└─────────────────────────────────────────────────┘
```

## Platform VM Responsibilities

### 1. Validator Management

The Platform VM maintains the active validator set. Validators stake LUX tokens and are selected to participate in consensus based on stake weight.

```go
type Validator struct {
    NodeID      ids.NodeID
    StartTime   time.Time
    EndTime     time.Time
    StakeAmount uint64
    RewardAddr  ids.ShortID
}
```

Key operations:
- `AddValidator`: Join the network as a validator
- `AddDelegator`: Delegate stake to an existing validator
- `RemoveValidator`: Exit the validator set (after stake period)

### 2. Subnet Creation

Subnets are sovereign networks that define their own execution logic and validator requirements. The Platform VM handles subnet lifecycle:

```go
type Subnet struct {
    ID         ids.ID
    ControlKey ids.ShortID
    Validators []ids.NodeID
}

type CreateSubnetTx struct {
    ControlKey ids.ShortID  // Who can add validators
    // ...
}
```

### 3. Blockchain Creation

Within subnets, the Platform VM creates and tracks blockchains:

```go
type CreateChainTx struct {
    SubnetID    ids.ID
    ChainName   string
    VMID        ids.ID      // Which VM to run
    GenesisData []byte
    // ...
}
```

### 4. Cross-Chain Transfers

The Platform VM coordinates asset transfers between chains via atomic transactions:

```go
type ExportTx struct {
    DestinationChain ids.ID
    Outputs          []*TransferableOutput
}

type ImportTx struct {
    SourceChain ids.ID
    Inputs      []*TransferableInput
}
```

## Staking Economics

Validators earn rewards proportional to their uptime and stake:

- **Minimum stake**: 2,000 LUX
- **Minimum delegation**: 25 LUX
- **Delegation fee**: 2% minimum (validator-configurable)
- **Stake period**: 2 weeks to 1 year
- **Target staking ratio**: 60% of supply

Rewards are calculated at stake period end:

```
reward = stake * (uptime_factor) * (period_factor) * (annual_rate)
```

## UTXO Model

The Platform VM uses a UTXO (Unspent Transaction Output) model for native assets:

```go
type UTXO struct {
    UTXOID   UTXOID
    Asset    ids.ID
    Output   TransferableOutput
}

type TransferableOutput interface {
    Verify() error
    Amount() uint64
    Addresses() []ids.ShortID
}
```

Benefits:
- Parallelizable transaction validation
- Simple SPV proofs
- Natural fit for atomic swaps

## Security Model

The Platform VM inherits Wave consensus security. Additionally:

- **Stake slashing**: Not implemented initially (planned for future)
- **Validator rotation**: Prevents long-term attacks
- **Economic security**: Cost to attack scales with staked value

## Current Status

The Platform VM is deployed on our testnet. Key metrics:

- Block time: ~2 seconds
- Validator set: 100+ nodes (testnet)
- Uptime target: 80% for rewards

## What's Next

With the Platform VM stable, we turn our attention to EVM compatibility. Next quarter, we will introduce the Contract Chain (C-Chain), bringing full Ethereum compatibility to Lux Network.

---

*The Platform VM source code will be open-sourced alongside mainnet launch.*
