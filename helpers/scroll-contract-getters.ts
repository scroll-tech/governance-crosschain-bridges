import { Signer, BigNumber } from 'ethers';
import {
  ScrollBridgeExecutor,
  ScrollBridgeExecutor__factory,
  MockL1ScrollMessenger,
  MockL1ScrollMessenger__factory,
  MockL2ScrollMessenger,
  MockL2ScrollMessenger__factory,
} from '../typechain';
import { tEthereumAddress } from './types';

export const deployScrollMessengers = async (
  signer: Signer
): Promise<[MockL1ScrollMessenger, MockL2ScrollMessenger]> => {
  const l1Messenger = await new MockL1ScrollMessenger__factory(signer).deploy();
  const l2Messenger = await new MockL2ScrollMessenger__factory(signer).deploy();
  await l1Messenger.deployTransaction.wait();
  await l2Messenger.deployTransaction.wait();
  await l1Messenger.setL2Messenger(l2Messenger.address);
  await l2Messenger.setL1Messenger(l1Messenger.address);
  return [l1Messenger, l2Messenger];
};

export const deployScrollBridgeExecutor = async (
  scrollMessenger: tEthereumAddress,
  ethereumExecutor: tEthereumAddress,
  delay: BigNumber,
  gracePeriod: BigNumber,
  minimumDelay: BigNumber,
  maximumDelay: BigNumber,
  guardian: tEthereumAddress,
  signer: Signer
): Promise<ScrollBridgeExecutor> => {
  const scrollBridgeExecutorFactory = new ScrollBridgeExecutor__factory(signer);
  const scrollBridgeExecutor = await scrollBridgeExecutorFactory.deploy(
    scrollMessenger,
    ethereumExecutor,
    delay,
    gracePeriod,
    minimumDelay,
    maximumDelay,
    guardian
  );
  await scrollBridgeExecutor.deployTransaction.wait();
  return scrollBridgeExecutor;
};
