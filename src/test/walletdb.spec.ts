import anyTest, { ExecutionContext, TestInterface } from 'ava';
import WalletDB from '../lib/wallet-repository';
import { MockInStream, MockOutStream } from './helpers/mocks/mock-stream';
import container from '../lib/container';
import { WalletOpts } from '../lib/wallet';
import loadConfig from '../lib/config';
import { loadWalletConf } from './helpers/utils';

type WalletDBTestContext = {
  db: WalletDB<MockOutStream, MockInStream>;
};

const test = anyTest as TestInterface<WalletDBTestContext>;

test.beforeEach(async (t: ExecutionContext<WalletDBTestContext>) => {
  t.context.db = new WalletDB(
    new MockOutStream(),
    new MockInStream(),
    await loadWalletConf('walletdb')
  );
});

test('walletdb can be loaded from existing file', (t: ExecutionContext<
  WalletDBTestContext
>) => {
  t.pass();
});
