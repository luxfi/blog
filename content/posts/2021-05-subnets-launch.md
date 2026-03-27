---
title: "Subnets Launch: Sovereign Networks for Everyone"
date: 2021-05-12T10:00:00-08:00
draft: false
author: "Zach Kelling"
tags: ["subnets", "launch", "scalability", "announcement"]
categories: ["Announcements"]
description: "Subnets are now live on Lux Network mainnet. Any organization can deploy their own sovereign blockchain network."
---

Today we open subnets to the public. Any organization can now deploy sovereign blockchain networks on Lux infrastructure.

## What Are Subnets?

A subnet is a dynamic set of validators working together to achieve consensus on one or more blockchains. Think of it as your own blockchain network, secured by validators you choose, running whatever virtual machine you need.

```
┌─────────────────────────────────────────────┐
│                Your Subnet                   │
│  ┌─────────────────────────────────────┐    │
│  │         Your Blockchain              │    │
│  │  - Custom VM (EVM, WASM, or custom) │    │
│  │  - Custom gas token                  │    │
│  │  - Custom block parameters           │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │         Your Validators              │    │
│  │  - Choose your validator set         │    │
│  │  - Set stake requirements            │    │
│  │  - Define compliance rules           │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
         │
         │ (validators also validate)
         ▼
┌─────────────────────────────────────────────┐
│            Primary Network                   │
│  X-Chain │ P-Chain │ C-Chain               │
└─────────────────────────────────────────────┘
```

## Why Subnets?

### 1. Horizontal Scaling

Each subnet adds capacity to the network. Unlike sharding (which divides existing capacity), subnets are additive:

```
Before Subnets:
Total Capacity = Primary Network Capacity

After Subnets:
Total Capacity = Primary + Subnet A + Subnet B + ... + Subnet N
```

There is no theoretical limit to the number of subnets.

### 2. Application-Specific Optimization

General-purpose chains make compromises. Subnets don't have to:

| Use Case | Optimal Configuration |
|----------|----------------------|
| High-frequency DeFi | Small validator set, 100ms blocks |
| Gaming | Custom VM, state channels built-in |
| Enterprise | Permissioned validators, compliance |
| Data availability | Large blocks, erasure coding |

### 3. Regulatory Compliance

Some applications require validator identification or geographic restrictions:

```go
type ComplianceConfig struct {
    RequireKYC        bool
    AllowedCountries  []string
    RequiredLicenses  []string
    AuditRequirements AuditConfig
}
```

Subnets enable compliant blockchain deployment without compromising the permissionless Primary Network.

### 4. Gas Token Flexibility

Subnets can use any token for gas:

- LUX (bridged from Primary Network)
- A native subnet token
- Stablecoins (for predictable costs)
- No gas at all (permissioned, subsidized)

## Creating a Subnet

### Step 1: Define Validators

Identify nodes that will validate your subnet. Each must already validate the Primary Network.

### Step 2: Create Subnet Transaction

```javascript
const { Lux } = require("lux");
const lux = new Lux("api.lux.network", 443, "https");

const pchain = lux.PChain();

// Create subnet
const unsignedTx = await pchain.buildCreateSubnetTx(
    utxoSet,
    [controlKeyAddress],  // Who can add validators
    threshold,            // Signatures required
    memo
);

const signedTx = unsignedTx.sign(keychain);
const txId = await pchain.issueTx(signedTx);
```

### Step 3: Add Validators

```javascript
const addValidatorTx = await pchain.buildAddSubnetValidatorTx(
    utxoSet,
    [controlKeyAddress],
    subnetId,
    nodeId,
    startTime,
    endTime,
    weight
);
```

### Step 4: Create Blockchain

```javascript
const createChainTx = await pchain.buildCreateChainTx(
    utxoSet,
    subnetId,
    chainName,
    vmId,           // Which VM to run
    fxIds,          // Feature extensions
    genesisData     // Initial state
);
```

### Step 5: Configure and Launch

Validators update their configuration to validate the new subnet:

```json
{
    "track-subnets": "subnet-id-here"
}
```

## Available Virtual Machines

### Subnet-EVM

Fork of C-Chain EVM with customization:

```json
{
    "config": {
        "chainId": 99999,
        "feeConfig": {
            "gasLimit": 15000000,
            "targetBlockRate": 2,
            "minBaseFee": 1000000000,
            "targetGas": 15000000,
            "baseFeeChangeDenominator": 36,
            "minBlockGasCost": 0,
            "maxBlockGasCost": 1000000,
            "blockGasCostStep": 200000
        }
    }
}
```

Customize:
- Gas limits and pricing
- Block production rate
- Precompiles (add custom native functions)
- Allow lists (permissioned deployment)

### SpacesVM (Experimental)

Key-value storage optimized VM:

```
SET key value
GET key
DELETE key
```

Designed for:
- Decentralized DNS
- Configuration storage
- Simple state machines

### BlobVM (Experimental)

Binary large object storage:

```
UPLOAD blob_data → content_hash
DOWNLOAD content_hash → blob_data
```

Designed for:
- NFT metadata
- Document storage
- Data availability

### Custom VMs

Build your own VM implementing our interface:

```go
type VM interface {
    Initialize(ctx *lux.Context, db database.Database,
               genesisBytes []byte, ...) error
    BuildBlock() (snowman.Block, error)
    ParseBlock([]byte) (snowman.Block, error)
    GetBlock(ids.ID) (snowman.Block, error)
    SetPreference(ids.ID) error
    LastAccepted() (ids.ID, error)
}
```

## Pricing

**Subnet creation**: Free (pay gas on P-Chain)
**Blockchain creation**: Free (pay gas on P-Chain)
**Validator requirements**: Each validator must stake minimum 2,000 LUX on Primary Network

The only recurring cost is validator infrastructure.

## Launch Partners

We're thrilled to announce our launch partners:

- **DeFi Kingdom**: Gaming subnet with custom tokenomics
- **Crabada**: Play-to-earn game with dedicated chain
- **Dexalot**: Central limit order book subnet

More announcements coming.

## Subnet Explorer

Track subnet activity at [subnets.lux.network](https://subnets.lux.network):

- Active subnets: 7
- Total subnet validators: 89
- Subnet blockchains: 12

## Get Started

1. **Documentation**: [docs.lux.network/subnets](https://docs.lux.network/subnets)
2. **Testnet faucet**: [faucet.lux.network](https://faucet.lux.network)
3. **Subnet-EVM template**: [github.com/luxfi/subnet-evm](https://github.com/luxfi/subnet-evm)
4. **Office hours**: Every Thursday, 10am PT

The era of application-specific blockchains begins now.

---

*For enterprise subnet inquiries: enterprise@lux.network*
