const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require("fs");

// (1)
const values = [
    ['0x023DbE08bEC000dDc4b743aC0d5cc65b1C4A086D', '100'],
    ['0x1CccC4D3789799a4513D85243bECc93412BBDc22', '100'],
    ['0xA60489284B69E58781FAfF4C70AA69AE5Ada0f00', '100'],
    ['0xdBD4D75960ae8A08b53E0B4f679c4Af487256B31', '100']
];

// (2)
const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

// (3)
console.log('Merkle Root:', tree.root);

// (4)
fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));
