const axios = require("axios");

const { KnownChainIDs } = require("./mavryk");

const api = axios.create();

const MVKT_API_BASE_URLS = {
  [KnownChainIDs.MAINNET]: 'https://api.mavryk.network/v1',
  [KnownChainIDs.BASENET]: 'https://basenet.api.mavryk.network/v1',
  // [KnownChainIDs.T4L3NT]: 'https://explorer-api.tlnt.net/v1',
  // [KnownChainIDs.T4L3NT_TEST]: 'https://explorer.tlnt.net:8009/v1'
};


const KNOWN_CHAIN_IDS = Object.keys(MVKT_API_BASE_URLS);

function isKnownChainId(chainId) {
  return chainId != null && KNOWN_CHAIN_IDS.includes(chainId);
}

async function getFromMvkt(chainId, endpoint, params) {
  const { data } = await api.get(endpoint, {
    baseURL: MVKT_API_BASE_URLS[chainId],
    params
  });

  return data;
}

async function fetchTokenMetadataFromMvkt(chainId, address, tokenId = '0') {
  if (!isKnownChainId(chainId)) return;

  const [token] = await getFromMvkt(chainId, '/tokens', {
    'contract.eq': address,
    'tokenId.eq': tokenId
  });

  const metadata = token?.metadata;
  if (!metadata) return null;

  const decimals = metadata.decimals && Number(metadata.decimals);

  return { ...metadata, decimals };
};

module.exports = fetchTokenMetadataFromMvkt;
