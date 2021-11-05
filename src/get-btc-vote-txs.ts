import { VoteTransaction } from './common/types';
import { btcToStxAddress, voteTransactionsUrl } from './common/utils';
import { Tx } from '@mempool/mempool.js/lib/interfaces/bitcoin/transactions';

function dedupe<T>(arr: T[], key: keyof T) {
  return arr.filter((item, index, self) => index === self.findIndex(t => t[key] === item[key]));
}

export async function getBTCVoteTransactions(approve: boolean): Promise<VoteTransaction[]> {
  const url = voteTransactionsUrl(approve);
  const response = await fetch(url);
  const txs: Tx[] = await response.json();

  const votes: VoteTransaction[] = [];

  txs.forEach(tx => {
    const [input] = tx.vin;
    const btcAddress = input.prevout.scriptpubkey_address;
    try {
      const stxAddress = btcToStxAddress(btcAddress);
      votes.push({
        stxAddress,
        txid: tx.txid,
        btcAddress,
        approve,
      });
    } catch (error) {
      console.error('Invalid address:', btcAddress);
    }
  });
  return dedupe(votes, 'btcAddress');
}
