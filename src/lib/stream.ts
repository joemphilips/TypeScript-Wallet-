import { Readable, Writable } from 'stream';
import logger from './logger';

// stream for encrypting/decrypting WalletDB data
export class EncryptStream extends Writable {
  private readonly box: any;
  constructor(opts: any) {
    super(opts);
  }

  public _write(chunk: Buffer, encoding: string, cb: () => {}): void {
    logger.error('not implemented !');
    cb();
  }

  public end(cb: () => {}): void {
    logger.error(`not implemented !`);
    cb();
  }
}

export class DecryptStream extends Readable {}

