import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ADDRESSES, CONSTANTS } from '../helpers/gov-constants';
import { eScrollNetwork } from '../helpers/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log(`Deployer: ${deployer}\n`);

  const scrollGov = await deployments.getOrNull('ScrollGov');

  if (scrollGov) {
    log(`Reusing scroll governance at: ${scrollGov.address}`);
  } else {
    let L2_SCROLL_MESSENGER = ADDRESSES['L2_SCROLL_MESSENGER'];
    let SCROLL_GOV_EXECUTOR = ADDRESSES['SCROLL_GOV_EXECUTOR'];
    if (hre.network.name == eScrollNetwork.scrollSepolia) {
        L2_SCROLL_MESSENGER = ADDRESSES['L2_SCROLL_MESSENGER_SEPOLIA'];
        SCROLL_GOV_EXECUTOR = ADDRESSES['SCROLL_GOV_EXECUTOR_SEPOLIA'];
      }

    await deploy('ScrollGov', {
      args: [
        L2_SCROLL_MESSENGER,
        SCROLL_GOV_EXECUTOR,
        CONSTANTS['DELAY'],
        CONSTANTS['GRACE_PERIOD'],
        CONSTANTS['MIN_DELAY'],
        CONSTANTS['MAX_DELAY'],
        ADDRESSES['SCROLL_GUARDIAN'],
      ],
      contract: 'ScrollBridgeExecutor',
      from: deployer,
      log: true,
    });
  }
};

export default func;
func.dependencies = [];
func.tags = ['ScrollGov'];
