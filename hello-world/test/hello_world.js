const HelloWorld = artifacts.require('HelloWorld')

contract('HelloWorld', function(accounts) {
    it('sets the first account as the contract creator', async function() {
        // This give a truffle abstraction which allow us to interact with our contracts.
        const contract = await HelloWorld.deployed()

        // Once we have the "contract" we can make calls or transations and then assert.
        // The following is making a call to get the creator.
        const creator = await contract.getCreator()

        assert.equal(creator, accounts[0], 'main account is the creator')
    })
    it('has hello world as initial message ', async function() {
        const contract = await HelloWorld.deployed()
        const message = await contract.getMessage()

        assert.equal(message, 'hello world', 'message is hello world')
    })
    it('changes the message via setMessage', async function() {
        const contract = await HelloWorld.deployed()

        // Execute a transaction and change the state of the contract.
        await contract.setMessage('hola mundo')

        // Get the new state.
        const message = await contract.getMessage()

        assert.equal(message, 'hola mundo', 'message is hola mundo')
    })
})