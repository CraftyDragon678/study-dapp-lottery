const Lottery = artifacts.require("Lottery");

contract('Lottery', ([deployer, user1, user2]) => {
  let lottery;
  beforeEach(async () => {
    console.log('Before each');
    lottery = await Lottery.new();
  });

  it.only('getPot should return current pot', async () => {
    let pot = await lottery.getPot();
    assert.equal(pot, 0);
  })
});