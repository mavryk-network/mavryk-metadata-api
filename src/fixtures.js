const { KnownChainIDs, getChainId } = require("./mavryk");

const MAINNET_FIXTURES = {
};

const FIXTURES_BY_CHAIN_ID = {
  [KnownChainIDs.MAINNET]: MAINNET_FIXTURES,
};

async function getFixture(slug) {
  const chainId = await getChainId();

  return FIXTURES_BY_CHAIN_ID[chainId]?.[slug];
}

module.exports = getFixture;
