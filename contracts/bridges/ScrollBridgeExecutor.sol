// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.10;

import {IScrollMessenger} from '../dependencies/scroll/interfaces/IScrollMessenger.sol';
import {L2BridgeExecutor} from './L2BridgeExecutor.sol';

/**
 * @title ScrollBridgeExecutor
 * @author Aave
 * @notice Implementation of the Scroll Bridge Executor, able to receive cross-chain transactions from Ethereum
 * @dev Queuing an ActionsSet into this Executor can only be done by the `L2ScrollMessenger` and having
 * the EthereumGovernanceExecutor as xDomainMessageSender
 */
contract ScrollBridgeExecutor is L2BridgeExecutor {
  // Address of the `L2ScrollMessenger` contract, in charge of redirecting cross-chain transactions in L2
  address public immutable L2_SCROLL_MESSENGER;

  /// @inheritdoc L2BridgeExecutor
  modifier onlyEthereumGovernanceExecutor() override {
    if (
      msg.sender != L2_SCROLL_MESSENGER ||
      IScrollMessenger(L2_SCROLL_MESSENGER).xDomainMessageSender() != _ethereumGovernanceExecutor
    ) revert UnauthorizedEthereumExecutor();
    _;
  }

  /**
   * @dev Constructor
   *
   * @param l2ScrollMessenger The address of the `L2ScrollMessenger` contract.
   * @param ethereumGovernanceExecutor The address of the `EthereumGovernanceExecutor` contract.
   * @param delay The delay before which an actions set can be executed
   * @param gracePeriod The time period after a delay during which an actions set can be executed
   * @param minimumDelay The minimum bound a delay can be set to
   * @param maximumDelay The maximum bound a delay can be set to
   * @param guardian The address of the guardian, which can cancel queued proposals (can be zero)
   */
  constructor(
    address l2ScrollMessenger,
    address ethereumGovernanceExecutor,
    uint256 delay,
    uint256 gracePeriod,
    uint256 minimumDelay,
    uint256 maximumDelay,
    address guardian
  )
    L2BridgeExecutor(
      ethereumGovernanceExecutor,
      delay,
      gracePeriod,
      minimumDelay,
      maximumDelay,
      guardian
    )
  {
    L2_SCROLL_MESSENGER = l2ScrollMessenger;
  }
}