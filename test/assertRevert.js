module.exports = async (promise) => {
  try {
    await promise;
    assert.fail('Expected revert but not received');
  } catch (e) {
    const revertFound = e.message.search('revert') >= 0;
    assert(revertFound, `Expected "revert", got ${e} instead.`)
  }
};
