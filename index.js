var redis = require('redis');
var uuid = require('node-uuid');
var bcrypt = require('bcrypt');
var ms = require('ms');
var moment = require('moment');
var debug = require('debug')('lockit-redis-adapter');

module.exports = function(config) {
	// Create connection as soon as module is required and share global db object
	// http://stackoverflow.com/a/7290591/1612721
	var client = redis.createClient(config.dbport, config.dbip);
	if(config.dbpass) {
		client.auth(config.dbpass, function () {
			debug('Redis client connected.');
		});
	}

	var adapter = {};

	// Create a new user and return user object
	adapter.save = function(name, email, pw, callback) {
		if(!name) {
			return callback('Missing username to store.');
		}
		if(!email) {
			return callback('Missing email to store.');	
		}
		if(!pw) {
			return callback('Missing password to store.');		
		}
		// Set sign up token expiration date
		var now = moment().toDate();
		if(!config.signupTokenExpiration) {
			return callback('Missing signupToken expiration.');
		}
		var timespan = ms(config.signupTokenExpiration);
		var future = moment().add(timespan, 'ms').toDate();

		var user = {
			username: name,
			email: email,
			signupToken: uuid.v4(),
			signupTimestamp: now,
			signupTokenExpires: future,
			failedLoginAttempts: 0
		};
		// Create hashed password
		bcrypt.hash(pw, 10, function (error, hash) {
			if(error) return callback(error);
			user.hash = hash;

			client.set(config.dbPrefix + ':' + user.username, JSON.stringify(user), function (error) {
				if(error) return callback(error);
				debug('New user created: %j', user);
				return callback(null, user);
			});
		});
	};

	// Find an existing user
	adapter.find = function(match, query, callback) {
		if(match !== 'username') {
			return callback('Redis can only lookup by keys (username).');
		}
		debug('Attempting to find user with %s "%s"', match, query);
		client.get(config.dbPrefix + ':' + query, function (error, reply) {
			if(error) return callback(error);
			return callback(null, reply);
		});
	};

	// Update an existing user and return updated user object
	adapter.update = function(user, callback) {
		// Update user in db
		client.set(config.dbPrefix + ':' + user.username, JSON.stringify(user), function (error) {
			if(error) return callback(error);
			debug('Updated user: %j', user);
			return callback(null, user);
		});
	};

	adapter.remove = function(match, query, callback) {
		if(match !== 'username') {
			return callback('Redis can only lookup by keys (username).');
		}
		client.del(config.dbPrefix + ':' + query, function (error, reply) {
			if(error) return callback(error);
			debug('User removed from db');
			if(reply === 0) {
				return callback(new Error('lockit - Cannot find ' + match + ': "' + query + '"'));
			}
			return callback(null, true);
		});
	};

	return adapter;
};