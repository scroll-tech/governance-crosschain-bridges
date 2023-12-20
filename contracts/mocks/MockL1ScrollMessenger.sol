//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import {IScrollMessenger} from '../dependencies/scroll/interfaces/IScrollMessenger.sol';

import {MockL2ScrollMessenger} from "./MockL2ScrollMessenger.sol";

contract MockL1ScrollMessenger is IScrollMessenger {
  address private sender;
  address private l2Messenger;

  function setSender(address _sender) external {
    sender = _sender;
  }

  function setL2Messenger(address _l2Messenger) external {
    l2Messenger = _l2Messenger;
  }

  function xDomainMessageSender() external view override returns (address) {
    return sender;
  }

  function sendMessage(
    address _target,
    uint256 _value,
    bytes calldata _message,
    uint256 _gasLimit
  ) external payable override {
    MockL2ScrollMessenger(l2Messenger).redirect{value: _value}(msg.sender, _target, _value, _message, _gasLimit);
  }

  function redirect(
    address _target,
    uint256 _value,
    bytes calldata _message,
    uint256 _gasLimit
  ) external payable {
    bool success;
    (success, ) = _target.call{value: _value, gas: _gasLimit}(_message);
  }
}
