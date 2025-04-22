const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const metadataUrl =
  "ipfs://bafkreiacocgtqvkww3wcq7tw2xyayyqj7lvrb24bkcvywwc3ajhwrwrrkq";

module.exports = buildModule("MyTokenModule", (m) => {
  const owner = m.getAccount(0);

  const myContract = m.contract("MyToken", [owner]);

  m.call(myContract, "safeMint", [owner, metadataUrl]);

  return { myContract };
});