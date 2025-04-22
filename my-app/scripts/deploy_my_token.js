const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Hardhat 네트워크 정보 가져오기
  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId;
  console.log(`네트워크: ${networkName} (Chain ID: ${chainId})`);

  // Ignition 배포 결과 파일 경로 설정
  const deploymentDir = path.join(
    __dirname,
    "..",
    "ignition",
    "deployments",
    `chain-${chainId}`
  );
  const deployedAddressesPath = path.join(
    deploymentDir,
    "deployed_addresses.json"
  );

  if (!fs.existsSync(deployedAddressesPath)) {
    console.error(
      `오류: 배포된 주소 파일을 찾을 수 없습니다: ${deployedAddressesPath}`
    );
    console.error(
      "먼저 'npx hardhat ignition deploy ./ignition/modules/MyToken.js --network sepolia'를 실행하여 컨트랙트를 배포하세요."
    );
    process.exit(1);
  }

  // 배포된 컨트랙트 주소 읽기
  const deployedAddresses = JSON.parse(
    fs.readFileSync(deployedAddressesPath, "utf8")
  );
  const contractAddress = deployedAddresses["MyTokenModule#MyTokenProxy"];

  if (!contractAddress) {
    console.error(
      "오류: deployed_addresses.json 파일에서 'MyTokenModule#MyToken' 주소를 찾을 수 없습니다."
    );
    process.exit(1);
  }

  console.log(`MyToken 배포 주소: ${contractAddress}`);

  // 배포된 컨트랙트 인스턴스 가져오기
  const myToken = await hre.ethers.getContractAt("MyToken", contractAddress);

  // 계정 가져오기
  const signers = await hre.ethers.getSigners();
  const ownerAddress = signers[0].address;
  console.log(`민팅할 계정 주소: ${ownerAddress}`);

  const amount = 100;

  console.log(`토큰 민팅 중... (Token ID: ${amount})`);

  try {
    // mint 함수 호출 - ERC721 토큰 민팅
    const tx = await myToken.mint(ownerAddress, amount);
    console.log(`트랜잭션 해시: ${tx.hash}`);
    console.log("트랜잭션이 채굴되기를 기다리는 중...");

    // 트랜잭션 완료 기다리기
    const receipt = await tx.wait();
    console.log(`민팅 성공! Gas 사용량: ${receipt.gasUsed.toString()}`);

    try {
      const balance = await myToken.balanceOf(ownerAddress);
      console.log(`소유자 잔액: ${balance}`);
    } catch (error) {
      console.log("참고: 이 토큰은 ERC721 방식이 아닐 수 있습니다.");
      console.log(error);
    }

    const secondAddress = signers[1].address;
    console.log(`두번째 계정 주소: ${secondAddress}`);

    const tx2 = await myToken.transfer(secondAddress, amount / 2);
    console.log(`트랜잭션 해시: ${tx2.hash}`);
    console.log("트랜잭션이 채굴되기를 기다리는 중...");

    const balance2 = await myToken.balanceOf(secondAddress);
    console.log(`두번째 계정 잔액: ${balance2}`);

    // totalSupply 확인
    const totalSupply = await myToken.totalSupply();
    console.log(`총 토큰 수: ${totalSupply}`);
  } catch (error) {
    console.error("민팅 실패:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });