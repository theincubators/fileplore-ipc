# IPC Explorer

The goal of this project is to build a minimum viable product (MVP) of the IPC explorer. See [what's next](#whats-next) after the MVP.

> InterPlanetary Consensus (IPC) is a revolutionary blockchain technology that powers planetary-scale web3 apps.

You can learn more about this technology 

Using IPC Explorer you can:

- [x] Browse subnets.
- [x] View subnet configuration.
- [x] View the last committed bottom-up checkpoint of a subnet.
- [x] View subnet genesis validators.
- [x] View recent subnet deposits.
- [x] View recent subnet withdrawals.
- [x] View recent subnet transactions.

Check out IPC Explorer [website](https://fileplorer.com) or run the application [locally](#running-locally).

## How it's made

- To narrow the scope of the MVP the decision was made to not build an indexing backend at this stage.
- The application relies on [public Filecoin RPC providers](https://docs.filecoin.io/networks/calibration/rpcs).
- IPC Explorer is a single page application (SPA) built using [React](https://react.dev).
- The application uses [ethers.js](https://ethers.org) to:
  - Call various methods of the IPC Subnet Actor (ISA) and the IPC Gateway Actor (IGA) smart contracts to collect various information about subnets.
  - Fetch blocks, transactions, and events from the root network and its child subnets.

## Known issues and limitations

- **Listing subnet withdrawals may not work.**
  It relies on the `NewBottomUpMsgBatch` event of the IPC Gateway Actor smart contract.
  But for some reason, I do not observe such events via a local subnet RPC during manual testing.
- **Connecting to a subnet RPC provider is subject to [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)**.
  Therefore, you can only connect to a local subnet RPC provider from a [locally running application](#running-locally).
  Connecting to a public subnet RPC provider is possible if the provider explicitly allows it by setting corresponding [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) headers.
- **Not displaying when the last bottom-up checkpoint of a subnet was committed to the parent**. Finding in what parent block a subnet committed its last bottom-up checkpoint is inefficient without having an indexing backend. In the worst-case scenario, you'd have to scan the parent from its current block down to the subnet's genesis block to find the last checkpoint transaction.

## Why building from scratch?

Since the [Filecoin Virtual Machine](https://fvm.filecoin.io) used by IPC is an EVM-compatible runtime, you may wonder, can't we just use some existing open-source blockchain explorer like [Blockscout](https://www.blockscout.com)?
And the short answer is yes, we can.
But, the user experience will be poor out-of-the-box.

- Blockscout doesn't support simultaneously connecting to multiple RPC providers.
  This means you either look at a parent or a child IPC network at a time.
  Or have to deploy a separate Blockscout instance for every subnet.
  Which seems inefficient.
- Blockscout is a general-purpose blockchain explorer and knows nothing about IPC subnets.
  Even if you upload and verify IPC-specific smart contracts into it, this will improve visibility into subnets just a little.
  And the UX will remain poor.
  Because you still need to manually call a set of Gateway and Subnet Actor methods to gather info about subnets.

So for the best visibility into subnets and a good user experience you either fork and extend something like Blockscout or build your own IPC explorer from scratch.
For this MVP I chose the latter.

## What's next?

Before the IPC General Availability launch (planned for 2024 Q3) I want to build a production-ready IPC explorer.
The key difference from the current MVP will be having an indexing backend.
This backend will greatly improve the UX of the explorer and enable new features.
To name a few:

- Full history of transactions, messages, events, etc. is available and searchable.
- Various charts and analytics based on real-time and historical data.
- Quicker application load times.

Another useful feature will be the ability to connect your Metamask wallet to a subnet.

## Development


#### Connecting to a local subnet RPC

You can only connect to a local subnet RPC from a locally running application due to [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). You also need a workaround because [Fendermint Ethereum API Facade](https://github.com/consensus-shipyard/ipc/tree/fbe598d0d2f908a3bddbcd4e7d3e5a31cd3a26d9/fendermint/eth/api) doesn't set CORS headers that would allow such connection from your browser.

The suggested workaround is to run a reverse proxy that sets required CORS headers.
In the following instruction, it's assumed that you're already running a subnet with Ethereum API Facade listening on `http://localhost:8545`. This should be the case if you followed [the official instruction](https://docs.ipc.space/quickstarts/deploy-a-subnet) about deploying a subnet.

1. Install [mitmproxy](https://mitmproxy.org).
2. Run it with a custom [cors.py](mitmproxy/cors.py) module:

```sh
mitmdump --mode reverse:http://localhost:8545 --listen-host localhost --listen-port 9545 -s mitmproxy/cors.py
```

Now you should be able to connect to subnet RPC from the locally running application. Note the non-standard provider URL (which is our reverse proxy) that you must enter after you click on the "Connect" button in the application:

```
http://localhost:9545
```

