// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Lottery {
  struct BetInfo {
    uint256 answerBlockNumber;
    address payable bettor;
    byte challenges;
  }

  uint256 private _tail;
  uint256 private _head;
  mapping (uint256 => BetInfo) private _bets;

  address public owner;

  uint256 constant internal BLOCK_LIMIT = 256;
  uint256 constant internal BET_BLOCK_INTERVAL = 3;
  uint256 constant internal BET_AMOUNT = 5 * 10 ** 15;
  uint256 private _pot;
  constructor() public {
    owner = msg.sender;
  }

  function getPot() public view returns (uint256 value) {
    return _pot;
  }

  // Bet

  /**
   * @dev bet. user send 0.005 ETH, send 1 byte character to bet.
   * bet info saved in queue is used in distribute function
   * @param challenges character bet by user
   * @return result check if function run well
   */
  function bet(byte challenges) public payable returns (bool result) {
    // check the proper ether is sent

    // push bet to the queue
    
    // emit event

    return true;
  }

  function getBetInfo(uint256 index) public view returns (
    uint256 answerBlockNumber,
    address bettor,
    byte challenges
  ) {
    BetInfo memory b = _bets[index];
    answerBlockNumber = b.answerBlockNumber;
    bettor = b.bettor;
    challenges = b.challenges;
  }

  function pushBet(byte challenges) public returns (bool) {
    BetInfo memory b;
    b.bettor = msg.sender;
    b.answerBlockNumber = block.number + BET_BLOCK_INTERVAL;
    b.challenges = challenges;

    _bets[_tail] = b;
    _tail++;

    return true;
  }

  function popBet(uint256 index) public returns (bool) {
    delete _bets[index];
    return true;
  }
}
