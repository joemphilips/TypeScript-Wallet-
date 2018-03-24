import * as btc from 'bitcoinjs-lib';
import * as ini from 'ini';
import * as path from 'path';

export interface Config {
  readonly debugLevel: 'debug' | 'info' | 'quiet';
  readonly datadir: string;
  readonly walletDBPath: string;
  readonly port: string;
  readonly debugFile: string;
  readonly network: btc.Network;
}

export class ConfigError extends Error {}

export interface ConfigOverrideOpts {
  /**
   * Usually ${datadir}/walletdb/
   */
  readonly datadir: string;
  /**
   * Usually ${datadir}/debug.log
   */
  readonly debugFile: string;
  /**
   * Usually ${datadir}/wallet.conf
   */
  readonly conf: string;
  /**
   * Usually localhost:58011
   */
  readonly port: string | number;
  readonly network: string;
}

const defaultappHome: string =
  process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] ||
  '~/.walletts';
const defaultDataDir = path.join(defaultappHome, '.walletts');
const defaultDebugFile = path.join(defaultDataDir, 'debug.log');
const defaultConfigFile = path.join(defaultDataDir, 'wallet.conf');
const defaultPort = '58011';
const defaultDebugLevel = 'info';

/**
 * setup global configuration object.
 * priority is
 * 1. field specified directly by opts (mostly this is the command line arguments given by the user)
 * 2. field defined in opts.conf (global configuration file)
 * 3. default value
 *
 * @param {ConfigOverrideOpts} opts
 * @returns {Config}
 */
export default function loadConfig(opts: Partial<ConfigOverrideOpts>): Config {
  const dataDir = opts.datadir || defaultDataDir;
  const filePath = opts.conf || defaultConfigFile;
  const fileConf = ini.decode(filePath);
  const debugFile = opts.debugFile
    ? opts.debugFile
    : fileConf.debugFile ? fileConf.debugFile : defaultDebugFile;
  const networkstring = opts.network
    ? opts.network
    : fileConf.network ? fileConf.network : 'testnet3';
  const network =
    networkstring === 'mainnet'
      ? btc.networks.bitcoin
      : networkstring === 'testnet3' ? btc.networks.testnet : false;
  if (!network) {
    throw new ConfigError('network option for config is not good!');
  }
  const port = opts.port
    ? opts.port
    : fileConf.port ? fileConf.port : defaultPort;
  const walletDBPath = path.join(dataDir + 'walletdb');

  return {
    port,
    datadir: dataDir,
    walletDBPath,
    debugLevel: defaultDebugLevel,
    debugFile,
    network
  };
}
