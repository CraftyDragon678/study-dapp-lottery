const Lottery = artifacts.require("Lottery");
const { assert } = require('chai');
const assertRevert = require('./assertRevert');
const expectEvent = require('./expectEvent');

contract('Lottery', ([deployer, user1, user2]) => {
  let lottery;
  const betAmount = 5 * (10 ** 15);
  const betAmountBN = new web3.utils.BN('5000000000000000');
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

  describe('distribute', () => {
    describe('when the answer is checkable', () => {
      it('should give the user the pot when the answer matches', async () => {
        await lottery.setAnswerForTest('0xab2184bcbc79b6efb7b066bb49abde84c12447c1cb6542aa7130a48064c5c4a7', { from: deployer });
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 1 -> 4
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 2 -> 5
        await lottery.betAndDistribute('0xab', { from: user1, value: betAmount }); // 3 -> 6
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 4 -> 7
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 5 -> 8
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 6 -> 9

        const potBefore = await lottery.getPot(); // 0.01 ETH
        const user1BalanceBefore = new web3.utils.BN(await web3.eth.getBalance(user1));

        const receipt7 = await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 7 -> 10 // give user1 pot money

        const potAfter = await lottery.getPot(); // 0 ETH
        const user1BalanceAfter = new web3.utils.BN(await web3.eth.getBalance(user1)); // == before + 0.015

        // check changes of pot money
        assert.equal(potBefore.toString(), new web3.utils.BN('10000000000000000').toString());
        assert.equal(potAfter.toString(), new web3.utils.BN('0').toString());

        // check user balance
        assert.equal(user1BalanceBefore.add(potBefore).add(betAmountBN).toString(), user1BalanceAfter.toString());
      });

      it('should give the user the amount he or she bet when a single character matches', async () => {
        await lottery.setAnswerForTest('0xab2184bcbc79b6efb7b066bb49abde84c12447c1cb6542aa7130a48064c5c4a7', { from: deployer });
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 1 -> 4
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 2 -> 5
        await lottery.betAndDistribute('0xaf', { from: user1, value: betAmount }); // 3 -> 6
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 4 -> 7
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 5 -> 8
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 6 -> 9

        const potBefore = await lottery.getPot(); // 0.01 ETH
        const user1BalanceBefore = new web3.utils.BN(await web3.eth.getBalance(user1));

        const receipt7 = await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 7 -> 10 // give user1 pot money

        const potAfter = await lottery.getPot(); // 0.01 ETH
        const user1BalanceAfter = new web3.utils.BN(await web3.eth.getBalance(user1)); // == before + 0.005 ETH

        // check changes of pot money
        assert.equal(potBefore.toString(), potAfter.toString());

        // check user balance
        assert.equal(user1BalanceBefore.add(betAmountBN).toString(), user1BalanceAfter.toString());
      });

      it('should get the eth of user when the answer does not match at all', async () => {
        await lottery.setAnswerForTest('0xab2184bcbc79b6efb7b066bb49abde84c12447c1cb6542aa7130a48064c5c4a7', { from: deployer });
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 1 -> 4
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 2 -> 5
        await lottery.betAndDistribute('0xdf', { from: user1, value: betAmount }); // 3 -> 6
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 4 -> 7
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 5 -> 8
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 6 -> 9

        const potBefore = await lottery.getPot(); // 0.01 ETH
        const user1BalanceBefore = new web3.utils.BN(await web3.eth.getBalance(user1));

        const receipt7 = await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 7 -> 10 // give user1 pot money

        const potAfter = await lottery.getPot(); // 0.015 ETH
        const user1BalanceAfter = new web3.utils.BN(await web3.eth.getBalance(user1)); // == before

        // check changes of pot money
        assert.equal(potBefore.add(betAmountBN).toString(), potAfter.toString());

        // check user balance
        assert.equal(user1BalanceBefore.toString(), user1BalanceAfter.toString());
      });
    });

    describe('when the answer is not revealed (not mined)', () => {
      it('', async () => {
        const potBefore = await lottery.getPot(); // 0 ETH

        await lottery.setAnswerForTest('0xab2184bcbc79b6efb7b066bb49abde84c12447c1cb6542aa7130a48064c5c4a7', { from: deployer });
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 1 -> 4
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 2 -> 5
        await lottery.betAndDistribute('0xdf', { from: user1, value: betAmount }); // 3 -> 6
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 4 -> 7
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 5 -> 8
        await lottery.betAndDistribute('0xef', { from: user2, value: betAmount }); // 6 -> 9

        const potAfter = await lottery.getPot(); // 0.01 ETH

        assert.equal(potBefore.add(betAmountBN).add(betAmountBN).toString(), potAfter.toString());
      });
    });

    describe('when the answer is not revealed(block limit is passed)', () => {
      it.only('', async () => {
        await lottery.setAnswerForTest('0xab2184bcbc79b6efb7b066bb49abde84c12447c1cb6542aa7130a48064c5c4a7', { from: deployer });
        const user1BalanceBefore = new web3.utils.BN(await web3.eth.getBalance(user1)); // == before

        await lottery.betAndDistribute('0xab', { from: user1, value: betAmount }); // 3 -> 6

        await Promise.all([...Array(260)].map(() => lottery.setAnswerForTest('0xab2184bcbc79b6efb7b066bb49abde84c12447c1cb6542aa7130a48064c5c4a7', { from: deployer })));
        const receipt = await lottery.betAndDistribute('0xab', { from: user1, value: betAmount }); // 3 -> 6

        const user1BalanceAfter = new web3.utils.BN(await web3.eth.getBalance(user1)); // == before

        // assert.equal(user1BalanceBefore.toString(), user1BalanceAfter.toString());
        // AH>>....
        await expectEvent.inLogs(receipt.logs, 'REFUND');
      });
    });
  });

  describe('isMatch', () => {
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
