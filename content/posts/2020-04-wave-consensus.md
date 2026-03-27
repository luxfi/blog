---
title: "Wave Consensus: A New Paradigm"
date: 2020-04-22T10:00:00-08:00
draft: false
author: "Zach Kelling"
tags: ["consensus", "protocol", "technical"]
categories: ["Technical"]
description: "Deep dive into the Wave consensus family powering Lux Network, achieving sub-second finality through probabilistic sampling."
---

Three months ago, we introduced Lux Network. Today, we publish the technical details of our consensus protocol family: **Wave**.

## Background: The Consensus Landscape

Traditional consensus falls into two categories:

**Classical Consensus** (PBFT, Paxos, Raft): Deterministic, fast, but requires known participants and scales poorly beyond ~100 nodes due to O(n^2) message complexity.

**Nakamoto Consensus** (Bitcoin, early Ethereum): Permissionless and robust, but slow (minutes to hours for finality) and energy-intensive.

Wave protocols occupy a new design space: permissionless like Nakamoto, fast like classical, and energy-efficient.

## The Wave Protocol Family

### Slush: The Foundation

Slush is a single-decree consensus protocol. Given a binary choice, nodes reach agreement through repeated sampling:

```
procedure slush(initial_preference):
    preference = initial_preference
    for round in 1..num_rounds:
        sample = random_sample(network, k)
        votes = query(sample, preference)
        if majority(votes) > alpha * k:
            preference = majority_color(votes)
    return preference
```

Each node queries a small random sample (k nodes) and adopts the majority preference if it exceeds a threshold (alpha). After sufficient rounds, all correct nodes converge to the same value with high probability.

### Flare: Adding Confidence

Flare extends Slush with a confidence counter. Nodes track consecutive rounds where their preference matches the sampled majority:

```
procedure flare(initial_preference):
    preference = initial_preference
    confidence = 0
    for round in 1..max_rounds:
        sample = random_sample(network, k)
        votes = query(sample, preference)
        if majority(votes) > alpha * k:
            if majority_color(votes) == preference:
                confidence++
            else:
                preference = majority_color(votes)
                confidence = 1
        else:
            confidence = 0
        if confidence >= beta:
            return preference  # finalized
    return undecided
```

### Wave: State Accumulation

Wave adds persistent counters for each color, providing stronger consistency guarantees:

```
procedure wave(initial_preference):
    preference = initial_preference
    confidence = 0
    counters = {red: 0, blue: 0}
    for round in 1..max_rounds:
        sample = random_sample(network, k)
        votes = query(sample, preference)
        if majority(votes) > alpha * k:
            counters[majority_color(votes)]++
            if counters[majority_color] > counters[preference]:
                preference = majority_color(votes)
            // confidence logic as in flare
        if confidence >= beta:
            return preference
    return undecided
```

### Lux: DAG Structure

Lux builds a directed acyclic graph (DAG) of transactions, using Wave for conflict resolution. This enables:

- **Parallelism**: Non-conflicting transactions finalize concurrently
- **Efficiency**: One query can finalize multiple transactions via ancestry
- **Consistency**: Conflicting transactions resolve deterministically

## Performance Characteristics

| Metric | Wave | Classical | Nakamoto |
|--------|------|-----------|----------|
| Finality | <1s | <1s | minutes-hours |
| Throughput | 4,500+ TPS | 1,000s TPS | 7-15 TPS |
| Energy | Minimal | Minimal | Massive |
| Participants | 1000s | <100 | Unlimited |

## Security Analysis

The Wave protocols achieve safety and liveness under the following assumptions:

- **Safety**: With high probability (1 - 2^-epsilon), all correct nodes decide on the same value if fewer than O(sqrt(n)) Byzantine nodes exist
- **Liveness**: The protocol terminates in O(log n) rounds with high probability

The key insight: metastability. Once a small majority forms (even by random chance), the sampling process amplifies it exponentially. An adversary would need to control a significant fraction of repeatedly sampled nodes to flip consensus - computationally infeasible.

## Implementation Status

The Wave consensus implementation is complete and undergoing security audits. Testnet launch is scheduled for Q3 2020.

We will release the full academic paper with formal proofs alongside the testnet.

---

*For questions about the consensus protocol, reach out to our research team.*
