const { MavrykToolkit, MichelCodecPacker, ChainIds } = require("@mavrykdynamics/taquito");
const { RpcClient, RpcClientCache } = require('@mavrykdynamics/taquito-rpc');
const {
  Tzip16Module,
  MavrykStorageHandler,
  MetadataProvider,
} = require("@mavrykdynamics/taquito-tzip16");
const { Tzip12Module } = require("@mavrykdynamics/taquito-tzip12");
const consola = require("consola");
const pMemoize = require("p-memoize");

const LambdaViewSigner = require("./signer");
const { rpcUrl } = require("./config");
const IpfsHttpHandler = require("./ipfs-handler-stacked");
const HttpHandlerWithIpfs = require("./http-handler-with-ipfs");
const HttpBackend = require("./http-backend");

const Mavryk = new MavrykToolkit(
  new RpcClientCache(
    new RpcClient(rpcUrl, undefined, new HttpBackend()),
    60_000
  )
);

const mavrykContext = Mavryk._context;

const ipfsHandler = new IpfsHttpHandler();
const httpHandler = new HttpHandlerWithIpfs(ipfsHandler);

const metadataProvider = new MetadataProvider(
  new Map([
    ["http", httpHandler],
    ["https", httpHandler],
    ["mavryk-storage", new MavrykStorageHandler()],
    ["ipfs", ipfsHandler],
  ])
);

Mavryk.addExtension(new Tzip16Module(metadataProvider));
Mavryk.addExtension(new Tzip12Module(metadataProvider));
Mavryk.setSignerProvider(new LambdaViewSigner());
Mavryk.setPackerProvider(new MichelCodecPacker());

const getChainId = pMemoize(async () => {
  const chainId = await Mavryk.rpc.getChainId();
  consola.info('Chain ID = ', chainId);

  return chainId;
});

getChainId().catch(err => {
  console.error('Failed to get Chain ID:', err);
  process.exit(1);
});

const KnownChainIDs = {
  ...ChainIds,
  BASENET: 'NetXmtMsNf69w1w',
  // /** DCP Network */
  // T4L3NT: 'NetXooyhiru73tk',
  // T4L3NT_TEST: 'NetXX7Tz1sK8JTa'
};

module.exports = {
  Mavryk,
  mavrykContext,
  KnownChainIDs,
  metadataProvider,
  getChainId
};
