import WritableStream = NodeJS.WritableStream;
import * as uuid from 'node-uuid';
import { Readable, Writable } from 'stream';
import { UIProxy, WalletAction } from '../bin/uiproxy';
import BackendProxy from './backend/node';
import { BlockchainProxy, TrustedBitcoindRPC } from './blockchain-proxy/';
import CoinManager from './coin_manager';
import {
  FailedToCreateWalletError,
  WalletError,
  WalletNotFoundError
} from './errors';
import Keystore, {
  InMemoryKeyRepository,
  default as KeyRepository
} from './key-repository';
import logger, { default as getLogger } from './logger';
import { AccountID } from './primitives/identity';
import WalletService from './wallet-service';
import * as Logger from 'bunyan';
import { Option } from '../lib/primitives/utils';
import { crypto } from 'bitcoinjs-lib';
import hash160 = crypto.hash160;
import { Account, NormalAccount } from './account';

export abstract class AbstractWallet {
  public abstract readonly coinManager: Option<CoinManager>;
  public abstract readonly bchproxy: Option<BlockchainProxy>;
  public abstract readonly id: AccountID;
  public abstract readonly accounts: ReadonlyArray<Account> | null;
  public abstract readonly pay: (
    k: Keystore,
    address: string
  ) => Promise<boolean>;
}

export class BasicWallet implements AbstractWallet {
  public readonly coinManager: Option<CoinManager>;
  private readonly logger: Option<Logger>;
  constructor(
    public readonly id: AccountID,
    public bchproxy: Option<TrustedBitcoindRPC>,
    public readonly accounts: ReadonlyArray<Account> = [],
    public parentLogger?: Logger
  ) {
    this.logger = parentLogger
      ? parentLogger.child({ subModule: 'BasicWallet' })
      : null;
    this.coinManager = null;
  }

  public async pay(k: Keystore, address: string): Promise<boolean> {
    if (!this.coinManager) {
      return false;
    }
    await this.coinManager.sign(k);
    return true;
  }
}

// Community wallet based on Voting Pool
// refs: http://opentransactions.org/wiki/index.php?title=Category:Voting_Pools
export class CommunityWallet extends BasicWallet {}

interface Series {
  readonly id: number;
  readonly isActive: true; // write now it will never deactivate
  readonly pubKeys: ReadonlyArray<Buffer>; // xpub
  readonly pubPrivKeys: ReadonlyArray<Buffer>; // xpriv
  readonly m: number;
}

interface Pool {
  readonly id: number;
  readonly seriesLookup: any;
}
