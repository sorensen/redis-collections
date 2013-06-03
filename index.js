'use strict';

/*!
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , format = util.format
  , redis = require('redis')
  , Lua = require('redis-lua-loader')
  , info = require('./package.json')
  , slice = Array.prototype.slice
  , concat = Array.prototype.concat
  , toString = Object.prototype.toString

/**
 * Collection constructor
 *
 * @param {Object} redis db client
 * @inherits EventEmitter
 * @event `ready`: Emitted when lua and redis client ready
 */

function Collection(client, key, options) {
  var self = this, len = 2
  options || (options = {})
  if (!key) {
    throw new Error('A collection key must be supplied.')
  }
  this.client = client
  this.key = key
  this.isList = !!options.list
  this.prefix = typeof options.prefix !== 'undefined'
    ? options.prefix
    : key + ':'

  // Load the related lua scripts
  this.lua = new Lua(client, __dirname + '/lua')
  
  // Ready callback
  function ready() {
    if (--len) return
    self.ready = true
    self.emit('ready')
  }
  // Wait for redis client ready event
  if (this.client.ready) ready()
  else this.client.on('ready', ready) 

  // Wait for lua client ready event
  if (this.lua.ready) ready()
  else this.lua.on('ready', ready) 
}

/*!
 * Inherit from EventEmitter.
 */

Collection.prototype.__proto__ = EventEmitter.prototype

/*!
 * Current library version, should match `package.json`
 */

Collection.VERSION = info.version

/**
 * Convert a key according to the current format
 *
 * @param {String} redis key
 * @return {String} formatted key
 */

Collection.prototype.format = function(key) {
  return this.prefix && key.indexOf(this.prefix) !== 0
    ? this.prefix + key
    : key
}

/**
 * Add a member into the collection, this will return an error if 
 * the key supplied was already a member of the set
 *
 * @param {String} redis key
 * @param {Any} data
 * @param {Function} callback
 */

Collection.prototype.add = function(key, score, next) {
  if (toString.call(score) === '[object Function]') {
    next = score
    score = 0
  }
  this.client.ZADD(this.key, score, key, function(err, resp) {
    if (err) return next(err)
    if (resp !== 1) return next(new Error('Member already exists'))
    return next(null, resp)
  })
  return this
}

/**
 * Add a member into the collection and save the obj
 *
 * @param {String} redis key
 * @param {Any} data
 * @param {Function} callback
 */

Collection.prototype.save = function(key, obj, score, next) {
  if (Array.isArray(obj) || toString.call(obj) === '[object Object]') {
    obj = JSON.stringify(obj)
  }
  if (toString.call(score) === '[object Function]') {
    next = score
    score = 0
  }
  key = this.format(key)
  this.lua.save(2, this.key, key, obj, score, this.isList, function(err, resp) {
    if (err) return next(err)
    next(err, resp)
  })
  return this
}

/**
 * Load all members of a collection
 *
 * @param {Function} callback
 */

Collection.prototype.load = function(next) {
  var list = this.isList
  this.lua.load(1, this.key, this.isList, function(err, resp) {
    if (err) return next(err)
    return next(null, list ? resp : resp.map(JSON.parse))
  })
  return this
}

/**
 * Remove a single member from the collection
 *
 * @param {String} key name
 * @param {Boolean} delete key (optional, default `true`)
 * @param {Function} callback
 */

Collection.prototype.remove = function(key, del, next) {
  key = this.format(key)
  if (toString.call(del) === '[object Function]') {
    next = del
    del = true
  }
  this.lua.remove(2, this.key, key, !!del, function(err, resp) {
    return next(err, resp)
  })
  return this
}

/**
 * Get all member keys of the collection
 *
 * @param {Function} callback
 */

Collection.prototype.members = function(next) {
  this.client.ZRANGEBYSCORE(this.key, '-inf', '+inf', function(err, resp) {
    if (err) return next(err)
    return next(null, resp)
  })
}

/**
 * Find the member count of the collection
 *
 * @param {Function} callback
 */

Collection.prototype.count = function(next) {
  this.client.ZCARD(this.key, function(err, resp) {
    if (err) return next(err)
    return next(null, resp)
  })
}

/**
 * Check if a given member is in the collection
 *
 * @param {String} key name
 * @param {Function} callback
 */

Collection.prototype.exists = function(key, next) {
  this.client.ZSCORE(this.key, this.format(key), function(err, resp) {
    if (err) return next(err)
    return next(null, resp !== null)
  })
}

/**
 * Destroy the collection along with all members
 *
 * @param {Function} callback
 */

Collection.prototype.destroy = function(next) {
  this.lua.destroy(1, this.key, function(err, resp) {
    return next(err, resp)
  })
  return this
}

/*!
 * Module exports.
 */

module.exports = Collection
