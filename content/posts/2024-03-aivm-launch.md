---
title: "AIVM Launch: AI-Native Virtual Machine"
date: 2024-03-13T10:00:00-08:00
draft: false
author: "Zach Kelling"
tags: ["aivm", "artificial-intelligence", "machine-learning", "launch"]
categories: ["Announcements"]
description: "Introducing AIVM, the first blockchain virtual machine designed natively for AI workloads with on-chain inference and verifiable ML."
---

Blockchain and AI have evolved separately. Today we merge them with AIVM, a virtual machine designed from the ground up for artificial intelligence workloads. Run ML models on-chain, verify inference results cryptographically, and build AI-native applications.

## The AI-Blockchain Gap

Current limitations when combining AI and blockchain:

1. **Computation**: ML inference is too expensive for standard EVMs
2. **Verification**: No way to prove a model produced a specific output
3. **Data**: Training data can't be verified on-chain
4. **Models**: Model weights don't fit in smart contract storage

AIVM solves each of these.

## AIVM Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                           AIVM                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Smart Contracts                        │  │
│  │  Solidity + AI Extensions                                │  │
│  │  - model.infer(input)                                    │  │
│  │  - model.verify(input, output, proof)                    │  │
│  │  - dataset.sample(index)                                 │  │
│  └────────────────────────────┬─────────────────────────────┘  │
│                               │                                 │
│  ┌────────────────────────────┴─────────────────────────────┐  │
│  │                   AI Execution Layer                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   Tensor    │  │   Model     │  │  Inference  │      │  │
│  │  │  Operations │  │   Registry  │  │   Engine    │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └────────────────────────────┬─────────────────────────────┘  │
│                               │                                 │
│  ┌────────────────────────────┴─────────────────────────────┐  │
│  │                  Verification Layer                       │  │
│  │  - ZK proofs for inference                               │  │
│  │  - Optimistic verification with fraud proofs             │  │
│  │  - Trusted execution environments (TEE)                  │  │
│  └────────────────────────────┬─────────────────────────────┘  │
│                               │                                 │
│  ┌────────────────────────────┴─────────────────────────────┐  │
│  │                   Hardware Layer                          │  │
│  │  GPU Clusters │ TPU Access │ Inference Accelerators      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## On-Chain Model Registry

### Registering Models

```solidity
interface IModelRegistry {
    struct Model {
        bytes32 id;
        bytes32 weightsHash;      // IPFS CID or commitment
        string architecture;       // "transformer", "cnn", etc.
        uint256[] inputShape;
        uint256[] outputShape;
        address owner;
        uint256 inferencePrice;   // Price per inference
    }

    function registerModel(
        bytes32 weightsHash,
        string calldata architecture,
        uint256[] calldata inputShape,
        uint256[] calldata outputShape,
        uint256 price
    ) external returns (bytes32 modelId);

    function getModel(bytes32 modelId) external view returns (Model memory);
}
```

### Supported Architectures

| Architecture | Max Parameters | Inference Time | Gas Cost |
|--------------|----------------|----------------|----------|
| MLP (dense) | 10M | 50ms | 100K |
| CNN | 50M | 100ms | 250K |
| Transformer (small) | 100M | 200ms | 500K |
| Transformer (large) | 1B | 2s | 2M |
| Custom ONNX | varies | varies | varies |

## Inference Execution

### Direct Inference

For small models, run inference directly on-chain:

```solidity
contract AIClassifier {
    IModelRegistry public registry;
    bytes32 public modelId;

    function classify(int256[] calldata input) external returns (uint256 class) {
        // Run inference on-chain
        int256[] memory output = AIVM.infer(modelId, input);

        // Find argmax
        int256 maxVal = type(int256).min;
        for (uint i = 0; i < output.length; i++) {
            if (output[i] > maxVal) {
                maxVal = output[i];
                class = i;
            }
        }

        return class;
    }
}
```

### Verified Off-Chain Inference

For large models, compute off-chain and verify:

```solidity
contract VerifiedAI {
    IModelRegistry public registry;
    IVerifier public verifier;
    bytes32 public modelId;

    function submitPrediction(
        int256[] calldata input,
        int256[] calldata output,
        bytes calldata proof
    ) external {
        // Verify the inference was computed correctly
        require(
            verifier.verifyInference(modelId, input, output, proof),
            "Invalid inference proof"
        );

        // Use the verified output
        _processPrediction(input, output);
    }
}
```

### Optimistic Inference

For latency-sensitive applications, verify optimistically:

```solidity
contract OptimisticAI {
    uint256 constant CHALLENGE_PERIOD = 1 hours;

    struct Prediction {
        bytes32 modelId;
        bytes32 inputHash;
        bytes32 outputHash;
        uint256 timestamp;
        address submitter;
        bool challenged;
    }

    mapping(bytes32 => Prediction) public predictions;

    function submitPrediction(
        bytes32 modelId,
        bytes32 inputHash,
        bytes32 outputHash
    ) external payable {
        require(msg.value >= BOND_AMOUNT, "Insufficient bond");

        bytes32 predictionId = keccak256(abi.encode(
            modelId, inputHash, outputHash, block.timestamp
        ));

        predictions[predictionId] = Prediction({
            modelId: modelId,
            inputHash: inputHash,
            outputHash: outputHash,
            timestamp: block.timestamp,
            submitter: msg.sender,
            challenged: false
        });
    }

    function challenge(
        bytes32 predictionId,
        int256[] calldata input,
        int256[] calldata correctOutput
    ) external {
        Prediction storage p = predictions[predictionId];
        require(block.timestamp < p.timestamp + CHALLENGE_PERIOD, "Too late");
        require(keccak256(abi.encode(input)) == p.inputHash, "Wrong input");

        // Re-run inference on-chain (or verify ZK proof)
        int256[] memory actual = AIVM.infer(p.modelId, input);

        if (keccak256(abi.encode(actual)) != p.outputHash) {
            // Slash submitter, reward challenger
            p.challenged = true;
            payable(msg.sender).transfer(BOND_AMOUNT);
        }
    }

    function finalize(bytes32 predictionId) external {
        Prediction storage p = predictions[predictionId];
        require(block.timestamp >= p.timestamp + CHALLENGE_PERIOD, "Not ready");
        require(!p.challenged, "Was challenged");

        // Prediction is valid, return bond
        payable(p.submitter).transfer(BOND_AMOUNT);
    }
}
```

## AI Precompiles

Native operations for ML workloads:

### Tensor Operations

```solidity
// Address: 0x0100000000000000000000000000000000000100
interface ITensor {
    function matmul(
        int256[] calldata a,
        uint256[] calldata shapeA,
        int256[] calldata b,
        uint256[] calldata shapeB
    ) external pure returns (int256[] memory result, uint256[] memory shape);

    function relu(int256[] calldata x) external pure returns (int256[] memory);

    function softmax(int256[] calldata x) external pure returns (int256[] memory);

    function layerNorm(
        int256[] calldata x,
        int256[] calldata gamma,
        int256[] calldata beta
    ) external pure returns (int256[] memory);
}
```

Gas costs (vs pure Solidity):

| Operation | Solidity Gas | Precompile Gas | Speedup |
|-----------|--------------|----------------|---------|
| MatMul 64x64 | 2.5M | 25K | 100x |
| ReLU 1024 | 50K | 500 | 100x |
| Softmax 1024 | 200K | 2K | 100x |

### Model Inference

```solidity
// Address: 0x0100000000000000000000000000000000000101
interface IInference {
    function infer(
        bytes32 modelId,
        int256[] calldata input
    ) external returns (int256[] memory output);

    function inferBatch(
        bytes32 modelId,
        int256[][] calldata inputs
    ) external returns (int256[][] memory outputs);
}
```

## Inference Providers

### Provider Network

Specialized nodes run GPU hardware for inference:

```yaml
# aivm-provider-config.yaml
provider:
  stake: 50000  # LUX
  hardware:
    gpus:
      - model: "NVIDIA H100"
        memory: 80GB
        count: 8
    tee: "Intel SGX"  # Optional: Trusted Execution

models:
  supported:
    - "llama-7b"
    - "stable-diffusion-xl"
    - "whisper-large"

pricing:
  base_rate: 0.001  # LUX per inference
  priority_multiplier: 2
```

### Provider Selection

Smart routing based on:
- Latency (geographic proximity)
- Price
- Reputation (accuracy history)
- Hardware capability

```solidity
contract InferenceRouter {
    function selectProvider(
        bytes32 modelId,
        uint256 maxLatency,
        uint256 maxPrice
    ) external view returns (address provider) {
        Provider[] memory candidates = getProvidersForModel(modelId);

        uint256 bestScore = 0;
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].latency > maxLatency) continue;
            if (candidates[i].price > maxPrice) continue;

            uint256 score = calculateScore(candidates[i]);
            if (score > bestScore) {
                bestScore = score;
                provider = candidates[i].addr;
            }
        }
    }
}
```

## Use Cases

### 1. On-Chain AI Agents

Autonomous agents with verifiable behavior:

```solidity
contract AIAgent {
    bytes32 public policyModelId;  // Decision-making model

    function act(bytes calldata observation) external {
        // Get action from AI model
        int256[] memory obs = abi.decode(observation, (int256[]));
        int256[] memory action = AIVM.infer(policyModelId, obs);

        // Execute action
        if (action[0] > 0) {
            _buyToken(uint256(action[1]));
        } else {
            _sellToken(uint256(action[1]));
        }

        emit ActionTaken(observation, action);
    }
}
```

### 2. AI-Gated Access

Use ML for access control:

```solidity
contract AIGatedVault {
    bytes32 public classifierModel;  // Fraud detection model

    function deposit(uint256 amount, bytes calldata userFeatures) external {
        int256[] memory features = abi.decode(userFeatures, (int256[]));
        int256[] memory scores = AIVM.infer(classifierModel, features);

        // Reject if fraud score is high
        require(scores[0] < FRAUD_THRESHOLD, "Suspicious activity");

        _deposit(msg.sender, amount);
    }
}
```

### 3. Dynamic NFTs

NFTs that evolve based on AI:

```solidity
contract AINFT is ERC721 {
    bytes32 public generatorModel;

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // Generate image based on token state
        int256[] memory state = getTokenState(tokenId);
        int256[] memory imageLatent = AIVM.infer(generatorModel, state);

        // Convert to base64 image
        return _encodeImage(imageLatent);
    }

    function evolve(uint256 tokenId, bytes calldata interaction) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");

        // Update state based on interaction
        int256[] memory currentState = getTokenState(tokenId);
        int256[] memory newState = AIVM.infer(evolutionModel,
            abi.encode(currentState, interaction)
        );

        setTokenState(tokenId, newState);
    }
}
```

### 4. Decentralized AI Marketplace

```solidity
contract AIMarketplace {
    struct Listing {
        bytes32 modelId;
        address creator;
        uint256 pricePerInference;
        uint256 totalRevenue;
    }

    mapping(bytes32 => Listing) public listings;

    function purchaseInference(
        bytes32 modelId,
        int256[] calldata input
    ) external payable returns (int256[] memory output) {
        Listing storage listing = listings[modelId];
        require(msg.value >= listing.pricePerInference, "Insufficient payment");

        // Run inference
        output = AIVM.infer(modelId, input);

        // Pay creator
        listing.totalRevenue += msg.value;
        payable(listing.creator).transfer(msg.value * 90 / 100);  // 10% platform fee
    }
}
```

## Security Considerations

### Model Integrity

Models are identified by hash of weights:
```
modelId = keccak256(weights || architecture || config)
```

Any modification produces different ID.

### Inference Verification Options

| Method | Latency | Cost | Trust |
|--------|---------|------|-------|
| On-chain (small models) | Low | High | Trustless |
| ZK proof | Medium | Medium | Trustless |
| Optimistic + fraud proof | Low | Low | Economic |
| TEE attestation | Low | Low | Hardware |

### Privacy

For sensitive inference:
- Encrypt inputs with provider's public key
- Use secure enclaves (SGX/TDX)
- ZK inference reveals only output

## Developer Tools

### SDK

```typescript
import { AIVM, Model } from '@luxfi/aivm-sdk';

// Connect to AIVM
const aivm = new AIVM({ network: 'mainnet' });

// Register a model
const modelId = await aivm.registerModel({
    weights: './model.onnx',
    architecture: 'transformer',
    inputShape: [1, 512],
    outputShape: [1, 1000],
    price: '0.001'  // LUX per inference
});

// Run inference
const output = await aivm.infer(modelId, inputTensor);

// Verify inference
const isValid = await aivm.verifyInference(modelId, input, output, proof);
```

### Model Conversion

```bash
# Convert PyTorch to AIVM format
aivm-convert pytorch model.pt --output model.aivm

# Convert TensorFlow
aivm-convert tensorflow saved_model/ --output model.aivm

# Convert ONNX
aivm-convert onnx model.onnx --output model.aivm
```

### Testing

```typescript
import { AIVMTestnet } from '@luxfi/aivm-sdk';

const testnet = new AIVMTestnet();

// Test inference
const result = await testnet.simulateInference(model, input);
console.log('Output:', result.output);
console.log('Gas used:', result.gasUsed);
console.log('Latency:', result.latency);
```

## Network Statistics

Launch metrics:

```
Models Registered: 127
Total Inferences: 2.4M
Inference Providers: 23
Total Provider Stake: 1.8M LUX
Average Inference Cost: 0.002 LUX
Average Latency: 180ms
```

## Roadmap

| Feature | Status |
|---------|--------|
| Core AIVM | Live |
| ZK inference proofs | Live |
| Provider network | Live |
| Large model support (1B+) | Q2 2024 |
| Training verification | Q3 2024 |
| Federated learning | Q4 2024 |

## Get Started

1. **Documentation**: [docs.lux.network/aivm](https://docs.lux.network/aivm)
2. **SDK**: `npm install @luxfi/aivm-sdk`
3. **Examples**: [github.com/luxfi/aivm-examples](https://github.com/luxfi/aivm-examples)
4. **Discord**: #aivm channel

AI meets blockchain. Build the future.

---

*AIVM whitepaper: [research.lux.network/aivm](https://research.lux.network/aivm)*
