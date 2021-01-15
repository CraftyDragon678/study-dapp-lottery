const Lottery = artifacts.require("Lottery");
const { assert } = require('chai');
const assertRevert = require('./assertRevert');
const expectEvent = require('./expectEvent');

contract('Lottery', ([deployer, user1, user2]) => {
  let lottery;
  const betAmount = 5 * (10 ** 15);
  const betBlockInterval = 3;
  beforeEach(async () => {
    lottery = await Lottery.new();
  });

  it('getPot should return current pot', async () => {
    let pot = await lottery.getPot();
    assert.equal(pot, 0);
  });

  describe('Bet', () => {
    it('should fail when the bet money is not 0.005 ETH', async () => {
      await assertRevert(lottery.bet('0xab', {
        // transaction object (chainId, value, to, from, gas(limit), gasPrice)
        value: 4 * (10 ** 15),
        from: user1,
      }));
    });
    it('should put the bet to the bet queue with 1 bet', async () => {
      // bet
      const receipt = await lottery.bet('0xab', {
        // transaction object (chainId, value, to, from, gas(limit), gasPrice)
        value: betAmount,
        from: user1,
      });
      // console.log(receipt);
      const pot = await lottery.getPot();
      assert.equal(pot, 0);

      // check contract balance == 0.005 ETH
      const contractBalance = await web3.eth.getBalance(lottery.address);
      assert.equal(contractBalance, betAmount);

      // check bet info
      const currentBlockNumber = await web3.eth.getBlockNumber();
      const bet = await lottery.getBetInfo(0);
      assert.equal(bet.answerBlockNumber, currentBlockNumber + betBlockInterval);
      assert.equal(bet.bettor, user1);
      assert.equal(bet.challenges, '0xab');

      // check event log
      await expectEvent.inLogs(receipt.logs, 'BET');
    });
  });

  describe.only('isMatch', () => {
    it('should be BettingResult.Win when two characters matach', async () => {
      const blockHash = '0xab2184bcbc79b6efb7b066bb49abde84c12447c1cb6542aa7130a48064c5c4a7';
      const matchingResult = await lottery.isMatch('0xab', blockHash);
      assert.equal(matchingResult, 1);
    });
    it('should be BettingResult.Fail when no characters matach', async () => {
      const blockHash = '0xab2184bcbc79b6efb7b066bb49abde84c12447c1cb6542aa7130a48064c5c4a7';
      const matchingResult = await lottery.isMatch('0xcd', blockHash);
      assert.equal(matchingResult, 0);
    });
    it('should be BettingResult.Draw when one characters matach', async () => {
      const blockHash = '0xab2184bcbc79b6efb7b066bb49abde84c12447c1cb6542aa7130a48064c5c4a7';
      const matchingResult = await lottery.isMatch('0xaf', blockHash);
      assert.equal(matchingResult, 2);

      const matchingResult2 = await lottery.isMatch('0xfb', blockHash);
      assert.equal(matchingResult2, 2);
    });
  });
});
