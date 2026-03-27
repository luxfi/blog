---
title: "Data Availability: Scalable On-Chain Storage"
date: 2024-06-19T10:00:00-08:00
draft: false
author: "Zach Kelling"
tags: ["data-availability", "scalability", "storage", "technical"]
categories: ["Technical"]
description: "Lux Network introduces a native data availability layer, enabling rollups and data-intensive applications with guaranteed availability and low costs."
---

Data availability is the bottleneck for blockchain scalability. Today we launch Lux DA, a native data availability layer providing guaranteed availability at 100x lower cost than Ethereum calldata.

## The Data Availability Problem

Rollups and data-intensive applications need to post data on-chain for security:

```
L2 Rollup Flow:
1. Batch transactions off-chain
2. Post batch data on-chain (for reconstruction)
3. Post state root on-chain (for verification)

If data is unavailable:
- Users can't verify state transitions
- Users can't exit the rollup
- Security degrades to operator trust
```

Current costs on Ethereum:
- Calldata: ~16 gas/byte = $10-50 per KB
- Blobs (EIP-4844): ~1 gas/byte = $0.50-2 per KB

Lux DA: $0.001-0.01 per KB

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Lux DA Layer                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Data Submission                        │ │
│  │  - Blob transactions                                   │ │
│  │  - Commitment generation (KZG)                         │ │
│  │  - Fee payment                                         │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │                                   │
│  ┌───────────────────────┴────────────────────────────────┐ │
│  │                  Consensus Layer                        │ │
│  │  - Order blob transactions                             │ │
│  │  - Commit to blob availability                         │ │
│  │  - Finalize with attestations                          │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │                                   │
│  ┌───────────────────────┴────────────────────────────────┐ │
│  │                  Storage Layer                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │ │
│  │  │  DA Node 1  │  │  DA Node 2  │  │  DA Node N  │    │ │
│  │  │  (erasure   │  │  (erasure   │  │  (erasure   │    │ │
│  │  │   coded)    │  │   coded)    │  │   coded)    │    │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Sampling Layer                         │ │
│  │  - Light clients sample random chunks                  │ │
│  │  - Statistical guarantee of availability               │ │
│  │  - No need to download full data                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### KZG Commitments

Data is committed using KZG polynomial commitments:

```
Data blob: [d₀, d₁, d₂, ..., dₙ]
            ↓
Polynomial: p(x) where p(i) = dᵢ
            ↓
Commitment: C = g^p(τ) (single group element, 48 bytes)
```

Properties:
- **Binding**: Can't open commitment to different data
- **Succinct**: Fixed size regardless of data size
- **Efficient proofs**: Prove any element in O(1)

```solidity
// Verify data at index i equals value v
function verify(
    bytes48 commitment,
    uint256 index,
    bytes32 value,
    bytes48 proof
) external view returns (bool) {
    return KZG.verify(commitment, index, value, proof);
}
```

### Erasure Coding

Data is erasure coded for redundancy:

```
Original data: [A, B, C, D] (4 chunks)
                    ↓
Reed-Solomon encode (2x expansion)
                    ↓
Encoded: [A, B, C, D, E, F, G, H] (8 chunks)

Any 4 of 8 chunks can reconstruct original
```

This enables:
- Nodes store only portions of data
- Data recoverable even if 50% of nodes fail
- Efficient fraud proofs for incorrect encoding

### Data Availability Sampling (DAS)

Light clients verify availability without downloading everything:

```go
func (lc *LightClient) VerifyAvailability(commitment Commitment) bool {
    // Sample random indices
    indices := randomSample(SAMPLE_SIZE)

    for _, idx := range indices {
        // Request chunk from random DA node
        chunk, proof := requestChunk(idx)

        // Verify chunk against commitment
        if !KZG.Verify(commitment, idx, chunk, proof) {
            return false
        }
    }

    return true  // High probability data is available
}
```

With 75 samples, probability of false positive (declaring available when >50% missing): < 2^-75

## Submitting Data

### Blob Transactions

```typescript
import { LuxDA } from '@luxfi/da-sdk';

const da = new LuxDA({ network: 'mainnet' });

// Submit data blob
const blob = new Uint8Array([/* your data */]);
const result = await da.submitBlob(blob);

console.log('Blob ID:', result.blobId);
console.log('Commitment:', result.commitment);
console.log('Block:', result.blockNumber);
console.log('Fee paid:', result.fee);
```

### Smart Contract Integration

```solidity
interface ILuxDA {
    struct BlobHeader {
        bytes32 blobId;
        bytes48 commitment;
        uint256 blockNumber;
        uint256 dataLength;
    }

    function submitBlob(bytes calldata data) external returns (bytes32 blobId);

    function getBlobHeader(bytes32 blobId) external view returns (BlobHeader memory);

    function verifyInclusion(
        bytes32 blobId,
        uint256 index,
        bytes32 leaf,
        bytes48 proof
    ) external view returns (bool);
}

contract RollupContract {
    ILuxDA public da;

    function submitBatch(
        bytes32 blobId,
        bytes32 newStateRoot,
        bytes calldata proof
    ) external {
        // Verify blob exists and is available
        ILuxDA.BlobHeader memory header = da.getBlobHeader(blobId);
        require(header.blockNumber > 0, "Blob not found");
        require(
            block.number - header.blockNumber < AVAILABILITY_WINDOW,
            "Blob expired"
        );

        // Verify state transition
        require(
            verifyStateTransition(header.commitment, newStateRoot, proof),
            "Invalid transition"
        );

        // Update state
        stateRoot = newStateRoot;
    }
}
```

## Pricing Model

### Base Pricing

```
Fee = DataSize * BaseFeePerByte * CongestionMultiplier

Where:
- BaseFeePerByte: 0.0000001 LUX (~$0.000001)
- CongestionMultiplier: 1x-10x based on demand
```

### Cost Comparison

| Layer | Cost per MB | Finality |
|-------|-------------|----------|
| Ethereum calldata | $10,000-50,000 | 12 min |
| Ethereum blobs | $500-2,000 | 12 min |
| Celestia | $0.50-2 | 12 sec |
| Lux DA | $0.01-0.10 | <1 sec |

### Storage Duration

Data availability is guaranteed for:
- **Minimum**: 30 days (included in base fee)
- **Extended**: Pay per additional month
- **Permanent**: Archive nodes (optional service)

After expiry, data may be pruned from DA nodes but:
- Commitments remain on-chain forever
- Anyone with data can prove inclusion
- Archive services maintain historical data

## Running a DA Node

### Requirements

| Spec | Minimum | Recommended |
|------|---------|-------------|
| CPU | 8 cores | 16 cores |
| RAM | 32 GB | 64 GB |
| Storage | 2 TB NVMe | 8 TB NVMe |
| Network | 1 Gbps | 10 Gbps |
| Stake | 10,000 LUX | 50,000 LUX |

### Configuration

```yaml
# da-node-config.yaml
node:
  role: da_node
  stake: 10000

storage:
  path: /data/lux-da
  max_size: 2TB
  retention_days: 30

network:
  listen: 0.0.0.0:9090
  bootstrap:
    - /dns/da1.lux.network/tcp/9090/p2p/...
    - /dns/da2.lux.network/tcp/9090/p2p/...

sampling:
  enabled: true
  interval: 1s
  sample_size: 75
```

### Rewards

DA nodes earn from:
1. **Storage fees**: Proportional to data stored
2. **Serving fees**: Payment for chunk requests
3. **Staking rewards**: Base APY for availability

## Use Cases

### 1. Optimistic Rollups

```
Rollup Architecture with Lux DA:

┌─────────────────────┐
│    Rollup Users     │
└──────────┬──────────┘
           │ Transactions
           ▼
┌─────────────────────┐
│    Sequencer        │
│  - Order txs        │
│  - Batch execution  │
└──────────┬──────────┘
           │ Batch data
           ▼
┌─────────────────────┐
│     Lux DA          │  ← Data availability
│  - Store batch      │
│  - KZG commitment   │
└──────────┬──────────┘
           │ Commitment
           ▼
┌─────────────────────┐
│   Settlement (L1)   │  ← Security
│  - State roots      │
│  - Fraud proofs     │
└─────────────────────┘
```

### 2. ZK Rollups

```solidity
contract ZKRollup {
    ILuxDA public da;
    IVerifier public verifier;

    function submitProof(
        bytes32 blobId,
        bytes32 oldRoot,
        bytes32 newRoot,
        bytes calldata zkProof
    ) external {
        // Verify DA
        ILuxDA.BlobHeader memory header = da.getBlobHeader(blobId);
        require(header.blockNumber > 0, "Data not available");

        // Verify ZK proof (includes commitment to batch data)
        require(
            verifier.verify(zkProof, [
                uint256(header.commitment),
                uint256(oldRoot),
                uint256(newRoot)
            ]),
            "Invalid proof"
        );

        // Update state
        stateRoot = newRoot;
    }
}
```

### 3. Data-Intensive dApps

```solidity
contract DecentralizedStorage {
    ILuxDA public da;

    struct File {
        bytes32[] blobIds;
        uint256 totalSize;
        bytes32 merkleRoot;
    }

    mapping(bytes32 => File) public files;

    function uploadFile(bytes32 fileId, bytes calldata data) external {
        // Split into chunks and submit
        bytes32[] memory blobIds = new bytes32[]((data.length / CHUNK_SIZE) + 1);

        for (uint i = 0; i < blobIds.length; i++) {
            bytes memory chunk = data[i * CHUNK_SIZE : (i + 1) * CHUNK_SIZE];
            blobIds[i] = da.submitBlob(chunk);
        }

        files[fileId] = File({
            blobIds: blobIds,
            totalSize: data.length,
            merkleRoot: computeMerkleRoot(blobIds)
        });
    }
}
```

### 4. AI Model Storage

```solidity
contract AIModelRegistry {
    ILuxDA public da;

    struct Model {
        bytes32[] weightBlobIds;
        bytes32 architectureHash;
        uint256 parameterCount;
    }

    function registerModel(
        bytes calldata weights,
        string calldata architecture
    ) external returns (bytes32 modelId) {
        // Store weights in DA layer
        bytes32[] memory blobIds = splitAndStore(weights);

        modelId = keccak256(abi.encode(blobIds, architecture));

        models[modelId] = Model({
            weightBlobIds: blobIds,
            architectureHash: keccak256(bytes(architecture)),
            parameterCount: weights.length / 4  // Assuming float32
        });
    }
}
```

## Security Model

### Availability Guarantees

Data is guaranteed available if:
1. Honest majority of DA nodes (by stake)
2. At least one honest sampler performs DAS
3. Data within retention period

### Fraud Proofs

Invalid erasure coding is provable:

```solidity
contract DAFraudProof {
    function proveInvalidEncoding(
        bytes32 blobId,
        uint256[] calldata indices,
        bytes32[] calldata chunks,
        bytes48[] calldata proofs
    ) external {
        // Verify chunks are authentic
        for (uint i = 0; i < indices.length; i++) {
            require(
                da.verifyInclusion(blobId, indices[i], chunks[i], proofs[i]),
                "Invalid chunk"
            );
        }

        // Attempt to decode
        bytes memory decoded = reedSolomonDecode(indices, chunks);

        // If decoding fails or doesn't match commitment, encoding was invalid
        if (decoded.length == 0 || !verifyAgainstCommitment(blobId, decoded)) {
            // Slash the submitter
            slashSubmitter(blobId);
        }
    }
}
```

## Performance

### Throughput

| Metric | Value |
|--------|-------|
| Max blob size | 128 KB |
| Max blobs per block | 1,024 |
| Block time | 2 seconds |
| Throughput | 64 MB/s |
| Daily capacity | 5.5 TB |

### Latency

| Operation | Time |
|-----------|------|
| Blob submission | <1s |
| Blob finality | <2s |
| Sampling verification | <100ms |
| Chunk retrieval | <50ms |

## Roadmap

| Feature | Status |
|---------|--------|
| Core DA layer | Live |
| KZG commitments | Live |
| DAS (light clients) | Live |
| Extended retention | Q3 2024 |
| Cross-chain DA | Q4 2024 |
| DA sharding | 2025 |

## Getting Started

1. **Documentation**: [docs.lux.network/da](https://docs.lux.network/da)
2. **SDK**: `npm install @luxfi/da-sdk`
3. **Run a node**: [docs.lux.network/da/node](https://docs.lux.network/da/node)
4. **Faucet**: [faucet.lux.network](https://faucet.lux.network)

Scalable data availability for the modular blockchain future.

---

*DA specification: [specs.lux.network/da](https://specs.lux.network/da)*
