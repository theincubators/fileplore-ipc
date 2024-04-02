import { ethers, toQuantity } from 'ethers'
import { MAX_PROVIDER_BLOCKS } from './ipc'
import { formatFil } from './utils'

const MAX_TRANSACTIONS = 10

// Due to performance reasons this function returns up to MAX_TRANSACTIONS transactions
// from the most recent MAX_PROVIDER_BLOCKS blocks.
export async function recentTransactions (providerUrl) {
  const provider = new ethers.JsonRpcProvider(providerUrl)

  const maxBlock = await provider.send('eth_blockNumber')
  const minBlock = Math.max(0, maxBlock - MAX_PROVIDER_BLOCKS + 1)

  const transactions = []

  for (let n = maxBlock; n >= minBlock; n--) {
    const block = await provider.send('eth_getBlockByNumber', [toQuantity(n), true])
    const blockTransactions = block.transactions.map(t => {
      return {
        transactionHash: t.hash,
        from: t.from,
        to: t.to,
        value: formatFil(t.value)
      }
    })

    transactions.push(...blockTransactions)
    if (transactions.length >= MAX_TRANSACTIONS) { break }
  }

  return transactions.slice(0, MAX_TRANSACTIONS)
}
