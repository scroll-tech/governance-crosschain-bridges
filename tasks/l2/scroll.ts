import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { ADDRESSES, CONSTANTS } from '../../helpers/gov-constants';

import { DRE } from '../../helpers/misc-utils';
import { eEthereumNetwork, eScrollNetwork } from '../../helpers/types';
import {
  Greeter__factory,
  IScrollMessenger__factory,
  ScrollBridgeExecutor__factory,
} from '../../typechain';

task(
  'scroll:initiate-greeting',
  'Queue a greeting in the governance executor on Scroll by transacting on L1'
).setAction(async (_, hre) => {
  await hre.run('set-DRE');

  if (DRE.network.name != eEthereumNetwork.sepolia && DRE.network.name != eEthereumNetwork.main) {
    throw new Error('Only applicable on mainnet or kovan where scroll L2 exist');
  }

  const GAS_LIMIT = 1500000;
  const MESSAGE = 'Miguel was also here';

  let L1_SCROLL_MESSENGER = ADDRESSES['L1_SCROLL_MESSENGER'];
  if (DRE.network.name == eEthereumNetwork.sepolia) {
    L1_SCROLL_MESSENGER = ADDRESSES['L1_SCROLL_MESSENGER_SEPOLIA'];
  }

  const l2 = DRE.companionNetworks['scroll'];

  const { deployer: deployerAddress } = await DRE.getNamedAccounts();
  const deployer = await DRE.ethers.getSigner(deployerAddress);
  console.log(
    `Deployer address: ${deployer.address} (${formatUnits(await deployer.getBalance())})`
  );

  // Note, the contract is on the scroll network, but only used to encode so no issue
  const scrollGov = ScrollBridgeExecutor__factory.connect(
    (await l2.deployments.get('ScrollGov')).address,
    deployer
  );
  console.log(`Scroll Gov at ${scrollGov.address}`);

  // Note, the contract is on the scroll network, but only used to encode so no issue
  const greeter = Greeter__factory.connect((await l2.deployments.get('Greeter')).address, deployer);
  console.log(`Greeter at ${greeter.address}`);

  const messenger = IScrollMessenger__factory.connect(L1_SCROLL_MESSENGER, deployer);
  console.log(`L1_SCROLL_MESSENGER at: ${messenger.address}`);

  const encodedGreeting = greeter.interface.encodeFunctionData('setMessage', [MESSAGE]);

  const targets: string[] = [greeter.address];
  const values: BigNumber[] = [BigNumber.from(0)];
  const signatures: string[] = [''];
  const calldatas: string[] = [encodedGreeting];
  const withDelegatecalls: boolean[] = [false];

  const encodedQueue = scrollGov.interface.encodeFunctionData('queue', [
    targets,
    values,
    signatures,
    calldatas,
    withDelegatecalls,
  ]);

  const tx = await messenger.sendMessage(scrollGov.address, 0, encodedQueue, GAS_LIMIT);
  console.log(`Transaction initiated: ${tx.hash}`);
});

task('scroll:execute-greeting', '')
  .addParam('id', 'Id of the proposal to execute')
  .setAction(async (taskArg, hre) => {
    await hre.run('set-DRE');

    if (
      DRE.network.name != eScrollNetwork.scroll &&
      DRE.network.name != eScrollNetwork.scrollSepolia
    ) {
      throw new Error('Only applicable on scroll L2');
    }

    const id = taskArg.id;

    const { deployer: deployerAddress } = await DRE.getNamedAccounts();
    const deployer = await DRE.ethers.getSigner(deployerAddress);
    console.log(
      `Deployer address: ${deployer.address} (${formatUnits(await deployer.getBalance())})`
    );

    // Note, the contract is on the scroll network, but only used to encode so no issue
    const scrollGov = ScrollBridgeExecutor__factory.connect(
      (await DRE.deployments.get('ScrollGov')).address,
      deployer
    );
    console.log(`Scroll Gov at ${scrollGov.address}`);

    // Note, the contract is on the scroll network, but only used to encode so no issue
    const greeter = Greeter__factory.connect(
      (await DRE.deployments.get('Greeter')).address,
      deployer
    );
    console.log(`Greeter at ${greeter.address}`);

    const tx = await scrollGov.execute(id);

    console.log(`Transaction initiated: ${tx.hash}`);
  });
