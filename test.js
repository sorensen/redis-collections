'use strict';

var assert = require('assert')
  , ase = assert.strictEqual
  , ade = assert.deepEqual
  , Collection = require('./index')
  , redis = require('redis')

describe('Redis Collections', function() {

  describe('Collections', function() {
    var db = redis.createClient()
      , users = new Collection(db, 'users', {})

    it('should emit a `ready` event', function(done) {
      users.ready ? done() : users.on('ready', done)
    })

    it('save an object into the collection', function(done) {
      users.save('1', {
        name: 'peter parker'
      , age: 24
      , alias: 'spiderman'
      }, function(err, resp) {
        ase(err, null)
        ase(resp, 1)
        done()
      })
    })

    it('should manually add a key', function(done) {
      var foo = {
        name: 'john smith'
      , age: 20
      }
      var key = 'users:209'
      db.HMSET(key, foo, function(err, ok) {
        ase(err, null)
        ase(ok, 'OK')

        users.add(key, function(err, resp) {
          ase(err, null)
          ase(resp, 1)
          done()
        })
      })
    })

    it('should see the member in the collection', function(done) {
      users.exists('1', function(err, resp) {
        ase(err, null)
        ase(resp, true)
        done()
      })
    })

    it('should get the member keys', function(done) {
      users.members(function(err, resp) {
        ase(err, null)
        ase(resp.length, 2)
        ase(!!~resp.indexOf('users:1'), true)
        done()
      })
    })

    it('should load all members', function(done) {
      users.load(function(err, resp) {
        var one = resp[0]
        ase(err, null)
        ase(one.age, '24')
        ase(one.alias, 'spiderman')
        done()
      })
    })

    it('should count the members', function(done) {
      users.count(function(err, resp) {
        ase(err, null)
        ase(resp, 2)
        done()
      })
    })

    it('should remove the member from the collection', function(done) {
      users.remove('1', function(err, resp) {
        done()
      })
    })

    it('should count the members', function(done) {
      users.count(function(err, resp) {
        ase(err, null)
        ase(resp, 1)
        done()
      })
    })

    it('should destroy the collection', function(done) {
      users.destroy(function(err, resp) {
        ase(err, null)
        ase(resp, 1)
        done()
      })
    })

    it('should disconnect from redis', function(done) {
      db.on('end', done)
      db.quit()
    })
  })

  describe('Lists', function() {
    var db = redis.createClient()
      , todos = new Collection(db, 'todos', {list: true })

    it('should emit a `ready` event', function(done) {
      todos.ready ? done() : todos.on('ready', done)
    })

    it('should save new items', function(done) {
      todos.save('one', 'test stuff', 1, function(err, resp) {
        ase(err, null)
        ase(resp, 1)

        todos.save('two', '...', 2, function(err, resp) {
          ase(err, null)
          ase(resp, 1)
          done()
        })
      })
    })

    it('should get the members', function(done) {
      todos.members(function(err, resp) {
        ase(err, null)
        ase(resp.length, 2)
        done()
      })
    })

    it('should count the items', function(done) {
      todos.count(function(err, resp) {
        ase(err, null)
        ase(resp, 2)
        done()
      })
    })

    it('should load the list', function(done) {
      todos.load(function(err, resp) {
        ase(err, null)
        ase(resp[0], 'test stuff')
        ase(resp[1], '...')
        done()
      })
    })

    it('should destroy the list', function(done) {
      todos.destroy(function(err, resp) {
        ase(err, null)
        ase(resp, 2)
        done()
      })
    })

    it('should disconnect from redis', function(done) {
      db.on('end', done)
      db.quit()
    })
  })
})
