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

  enum BlockStatus { Checkable, NotRevealed, BlockLimitPassed }
  enum BettingResult { Fail, Win, Draw }

  event BET(uint256 index, address bettor, uint256 amount, byte challenges, uint256 answerBlockNumber);

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
    require(msg.value == BET_AMOUNT, 'Not enough ETH');
    // push bet to the queue
    require(pushBet(challenges), 'Fail to add a new Bet info');
    // emit event
    emit BET(_tail - 1, msg.sender, msg.value, challenges, block.number + BET_BLOCK_INTERVAL);
    return true;
  }

  function distribute() public {
    uint256 cur;
    BetInfo memory b;
    BlockStatus currentBlockStatus;
    for (cur = _head; cur < _tail; cur++) {
      b = _bets[cur];
      currentBlockStatus = getBlockStatus(b.answerBlockNumber);

      if (currentBlockStatus == BlockStatus.Checkable) {
        // if win, bettor gets pot
        // if fail, bettor's money goes pot
        // if draw, refund bettor's money
      }

      if (currentBlockStatus == BlockStatus.NotRevealed) {
        break;
      }
      
      if (currentBlockStatus == BlockStatus.BlockLimitPassed) {
        // refund
        // emit refund
      }
      popBet(cur);
    }
  }

  /**
   * @dev get result of bet
   * @param challenges bet character
   * @param answer blockhash
   * @return result
   */
  function isMatch(byte challenges, bytes32 answer) public pure returns (BettingResult) {
    // challenges 0xab
    // answer 0xab.....ff  32bytes

    byte c1 = challenges;
    byte c2 = challenges;
    
    byte a1 = answer[0];
    byte a2 = answer[0];

    // get first number
    c1 = c1 >> 4;
    c1 = c1 << 4;
    a1 = a1 >> 4;
    a1 = a1 << 4;

    // get second number
    c2 = c2 << 4;
    c2 = c2 >> 4;
    a2 = a2 << 4;
    a2 = a2 >> 4;

    if (a1 == c1 && a2 == c2) {
      return BettingResult.Win;
    }
    
    if (a1 == c1 || a2 == c2) {
      return BettingResult.Draw;
    }

    return BettingResult.Fail;
  }

  function getBlockStatus(uint256 answerBlockNumber) internal view returns (BlockStatus) {
    if (block.number > answerBlockNumber && block.number < BLOCK_LIMIT + answerBlockNumber) {
      return BlockStatus.Checkable;
    }
    if (block.number <= answerBlockNumber) {
      return BlockStatus.NotRevealed;
    }
    if (block.number >= answerBlockNumber + BLOCK_LIMIT) {
      return BlockStatus.BlockLimitPassed;
    }
    return BlockStatus.BlockLimitPassed;
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

  function pushBet(byte challenges) internal returns (bool) {
    BetInfo memory b;
    b.bettor = msg.sender;
    b.answerBlockNumber = block.number + BET_BLOCK_INTERVAL;
    b.challenges = challenges;

    _bets[_tail] = b;
    _tail++;

    return true;
  }

  function popBet(uint256 index) internal returns (bool) {
    delete _bets[index];
    return true;
  }
}
