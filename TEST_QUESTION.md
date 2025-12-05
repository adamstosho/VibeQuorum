# Test Question for VibeQuorum

## Quick Test Question (Copy & Paste)

Use this question to test the platform:

**Title:**
```
How do I implement a gas-efficient ERC20 token transfer with batch processing?
```

**Description:**
```
I'm building a DeFi application that needs to handle multiple ERC20 token transfers efficiently. Currently, I'm making individual transfer calls which is expensive in terms of gas fees. 

I've heard about batch processing techniques but I'm not sure about the best approach. Should I:
1. Use a batch transfer function in my smart contract?
2. Use a relayer pattern with meta-transactions?
3. Implement a merkle tree for claimable tokens?

What are the gas savings for each approach, and are there any security considerations I should be aware of? I'm particularly concerned about reentrancy attacks and ensuring atomicity of batch operations.

Any code examples or best practices would be greatly appreciated!
```

**Tags:**
```
solidity, ethereum, gas-optimization, defi, smart-contracts
```

---

## Test via Frontend

1. Go to `/ask` page
2. Connect your wallet
3. Copy and paste the question above
4. Submit and test:
   - View the question
   - Generate AI draft answer
   - Post an answer
   - Vote on answers
   - Accept an answer

---

## Test via API (requires wallet signature)

If you want to test via API, you'll need to:
1. Sign a message with your wallet
2. Use the signature in the request headers

Example curl command (replace with your wallet address and signature):
```bash
curl -X POST http://localhost:4000/api/questions \
  -H "x-wallet-address: YOUR_WALLET_ADDRESS" \
  -H "x-signature: YOUR_SIGNATURE" \
  -H "x-timestamp: $(date +%s)000" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How do I implement a gas-efficient ERC20 token transfer with batch processing?",
    "description": "I'\''m building a DeFi application that needs to handle multiple ERC20 token transfers efficiently. Currently, I'\''m making individual transfer calls which is expensive in terms of gas fees. I'\''ve heard about batch processing techniques but I'\''m not sure about the best approach. Should I: 1. Use a batch transfer function in my smart contract? 2. Use a relayer pattern with meta-transactions? 3. Implement a merkle tree for claimable tokens? What are the gas savings for each approach, and are there any security considerations I should be aware of?",
    "tags": ["solidity", "ethereum", "gas-optimization", "defi", "smart-contracts"]
  }'
```

