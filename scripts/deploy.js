import fs from 'fs'
import hre from 'hardhat'

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  console.log('Deploying GeoWeb3 contracts with:', deployer.address)

  const GEOWToken = await hre.ethers.getContractFactory('GEOWToken')
  const geow = await GEOWToken.deploy()
  await geow.waitForDeployment()

  const ServiceNFT = await hre.ethers.getContractFactory('ServiceNFT')
  const nft = await ServiceNFT.deploy(await geow.getAddress())
  await nft.waitForDeployment()

  const RewardsEngine = await hre.ethers.getContractFactory('RewardsEngine')
  const rewards = await RewardsEngine.deploy(await geow.getAddress())
  await rewards.waitForDeployment()

  const GeoWeb3DAO = await hre.ethers.getContractFactory('GeoWeb3DAO')
  const dao = await GeoWeb3DAO.deploy(await geow.getAddress())
  await dao.waitForDeployment()

  await (await geow.addMinter(await nft.getAddress())).wait()
  await (await geow.addMinter(await rewards.getAddress())).wait()

  if (process.env.ORACLE_ADDRESS) await (await rewards.setOracle(process.env.ORACLE_ADDRESS)).wait()

  const out = {
    network: hre.network.name,
    deployer: deployer.address,
    GEOW_TOKEN: await geow.getAddress(),
    SERVICE_NFT: await nft.getAddress(),
    REWARDS_ENGINE: await rewards.getAddress(),
    GEOW_DAO: await dao.getAddress(),
    deployedAt: new Date().toISOString(),
  }
  fs.mkdirSync('deploy', { recursive: true })
  fs.writeFileSync(`deploy/${hre.network.name}.json`, JSON.stringify(out, null, 2))
  console.log(JSON.stringify(out, null, 2))
}

main().catch((err) => { console.error(err); process.exit(1) })
