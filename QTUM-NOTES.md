Janus is a RPC compatibility layer that transforms Ethereum RPC calls to QTUM
RPC calls. This allows popular DApp libraries such as Truffle and Web3 to be used on QTUM.

```
Truffle+Web3 <-> Janus (RPC API) <-> QTUM (RPC API inherited from BTC)
```

Janus is considered an experimental project. It has enough API compatibility
coverage to run some Truffle projects (e.g. [the Pet Shop
tutorial](https://truffleframework.com/tutorials/pet-shop)), but expect to
encounter problems.

See: [Supported ETH RPC calls](https://github.com/qtumproject/janus/tree/master/pkg/transformer)

Raise issues if you run into API compatibility problems.

# Build Janus From Source

As Janus is experimental, the recommended way to try it is to build it from
source.

Download Janus source code:

```
go get github.com/dcb9/janus
```

Enter the project root:

```
cd $GOPATH/src/github.com/dcb9/janus
```

Build the Janus binary:

```
go build -o janus cli/janus/main.go
```

The `janus` binary should be available at project root.

# Running Janus and Qtum RPC

Run Qtum RPC (in regtest mode) on port 3889:

```
qtumd -regtest \
 -rpcbind=0.0.0.0:3889 -rpcallowip=0.0.0.0/0 \
 -datadir=.qtum \
 -logevents \
 -rpcuser=qtum -rpcpassword=testpasswd \
 -deprecatedrpc=accounts \
 -printtoconsole
```

Run Janus on port 23889, which will proxy ETH RPC requests to Qtum RPC:

```
QTUM_RPC=http://qtum:testpasswd@localhost:3889 QTUM_NETWORK=regtest janus --dev
```

# Create Test Accounts

Let's generate some test accounts, and fund them.

```
alias qcli='.qtum-cli -rpcuser=qtum -rpcpassword=testpasswd'
```

Create two test accounts, and fund them by mining 500 blocks:

```
# addr=qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW hdkeypath=m/88'/0'/1'
qcli importprivkey cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk
# addr=qLn9vqbr2Gx3TsVR9QyTVB5mrMoh4x43Uf hdkeypath=m/88'/0'/2'
qcli importprivkey cRcG1jizfBzHxfwu68aMjhy78CpnzD9gJYZ5ggDbzfYD3EQfGUDZ

qcli generatetoaddress 500 qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW
qcli generatetoaddress 500 qLn9vqbr2Gx3TsVR9QyTVB5mrMoh4x43Uf
```

Note that the base58 addresses correspond to the following hex addresses

```
# 7926223070547d2d15b2ef5e7383e541c338ffe9
qcli gethexaddress qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW

# 2352be3db3177f0a07efbe6da5857615b8c9901d
qcli gethexaddress qLn9vqbr2Gx3TsVR9QyTVB5mrMoh4x43Uf
```

# Test Janus RPC calls

Now we'll check if Janus is working by making a few ETH RPC calls.

Use the [eth_getbalance](https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_getbalance) to get their balances.

```
curl -X POST -d \
'{"jsonrpc":"2.0",
 "method":"eth_getBalance",
  "params":
    ["0x7926223070547d2d15b2ef5e7383e541c338ffe9", "latest"],
  "id":1
}' http://127.0.0.1:23889

{"jsonrpc":"2.0","result":"0xb32a6b6c1e1bb","id":1}
```

Use [eth_accounts] to list known accounts:

```
curl -X POST -d \
'{"jsonrpc":"2.0",
 "method":"eth_accounts",
  "params":
    ["0x7926223070547d2d15b2ef5e7383e541c338ffe9", "latest"],
  "id":1
}' http://127.0.0.1:23889

{"jsonrpc":"2.0","result":["0x2352be3db3177f0a07efbe6da5857615b8c9901d","0x7926223070547d2d15b2ef5e7383e541c338ffe9"],"id":1}
```

# Truffle Tests

Now let's try to run OpenZeppelin's Truffle tests using Janus.

First, check out a OpenZeppelin that had been slightly tweaked to work with Janus:

```
git clone git@github.com:hayeah/openzeppelin-solidity.git
cd openzeppelin-solidity
git checkout qtum
```

Install NodeJS dependencies:

```
yarn
```

Try to run tests for Arrays:

```
npx truffle test test/utils/Arrays.test.js
```

You should see that all test cases passed:

```
Using network 'development'.


Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



  Contract: Arrays
    Even number of elements
      ✓ should return correct index for the basic case
      ✓ should return 0 for the first element
      ✓ should return index of the last element
      ✓ should return first index after last element if searched value is over the upper boundary
      ✓ should return 0 for the element under the lower boundary
    Odd number of elements
      ✓ should return correct index for the basic case
      ✓ should return 0 for the first element
      ✓ should return index of the last element
      ✓ should return first index after last element if searched value is over the upper boundary
      ✓ should return 0 for the element under the lower boundary
    Array with gap
      ✓ should return index of first element in next filled range
    Empty array
      ✓ should always return 0 for empty array


  12 passing (3s)
```

And from the Janus log output, you should be able to see the ETH RPC requests and responses:

```
=> ETH request
{
  "id": 12,
  "jsonrpc": "2.0",
  "method": "eth_call",
  "params": [
    {
      "data": "0x33e3a58a000000000000000000000000000000000000000000000000000000000000000a",
      "from": "0x7926223070547d2d15b2ef5e7383e541c338ffe9",
      "gas": "0x6691b7",
      "gasPrice": "0x64",
      "to": "0xe2ea0f97a7ba7c4523246e55a0bf01dc2cb2d44c"
    },
    "latest"
  ]
}
<= ETH response
{
  "id": 12,
  "jsonrpc": "2.0",
  "result": "0x0000000000000000000000000000000000000000000000000000000000000000"
}
```

As well as the QTUM RPC requests and responses:

```
=> qtum RPC request
{
  "jsonrpc": "1.0",
  "method": "callcontract",
  "id": "200",
  "params": [
    "e2ea0f97a7ba7c4523246e55a0bf01dc2cb2d44c",
    "33e3a58a000000000000000000000000000000000000000000000000000000000000000a",
    "qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW",
    6721975
  ]
}
<= qtum RPC response
{
  "error": null,
  "id": "200",
  "result": {
    "address": "e2ea0f97a7ba7c4523246e55a0bf01dc2cb2d44c",
    "executionResult": {
      "codeDeposit": 0,
      "depositSize": 0,
      "excepted": "None",
      "gasForDeposit": 0,
      "gasRefunded": 0,
      "gasUsed": 22055,
      "newAddress": "e2ea0f97a7ba7c4523246e55a0bf01dc2cb2d44c",
      "output": "0000000000000000000000000000000000000000000000000000000000000000"
    },
    "transactionReceipt": {
      "bloom": "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "gasUsed": 22055,
      "log": [],
      "stateRoot": "39e2079439839de19096e59d486549867dca2165910d78dbf2fec45a09799cd3"
    }
  }
}
```

# Next

We are working on making as many of the OpenZeppelin tests pass as possible, and we welcome your help!
