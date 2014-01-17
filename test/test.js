var should = require('should');
var config = require('./config.js');
var adapter = require('../index.js')(config);

// Wait for connection to db
before(function(done) {
	setTimeout(function() {
		done();
	}, 3000);
});

describe('lockit-redis-adapter', function() {
	it('should create a new user', function(done) {
		adapter.save('john', 'john@email.com', 'secret', function(err, res) {
			if (err) {
				console.log(err);
			}
			res.should.have.property('signupToken');
			res.signupToken.should.match(/[0-9a-f]{22}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
			res.should.have.property('failedLoginAttempts');
			res.failedLoginAttempts.should.equal(0);
			res.email.should.equal('john@email.com');
			done();
		});
	});

	it('should find a user by username', function(done) {
		adapter.find('username', 'john', function(err, res) {
			if (err) {
				console.log(err);
			}
			res.username.should.equal('john');
			res.email.should.equal('john@email.com');
			done();
		});
	});

	it('should return undefined when no user is found', function(done) {
		adapter.find('username', 'jim', function(err, res) {
			if (err) {
				console.log(err);
			}
			should.not.exist(err);
			should.not.exist(res);
			done();
		});
	});

	it('should update an existing user', function(done) {
		adapter.find('username', 'john', function(err, doc) {
			if (err) {
				console.log(err);
			}
			doc.test = 'works';
			doc.editet = true;
			adapter.update(doc, function(err, res) {
				if (err) {
					console.log(err);
				}
				res.test.should.equal('works');
				res.editet.should.be.true;
				done();
			});
		});
	});

	it('should remove a user', function(done) {
		adapter.save('jeff', 'jeff@email.com', 'secret', function(err, res) {
			if (err) {
				console.log(err);
			}
			adapter.remove('username', 'jeff', function(err, res) {
				if (err) {
					console.log(err);
				}
				res.should.be.true;
				done();
			});
		});
	});

	it('should return an error when remove cannot find a user', function(done) {
		adapter.remove('username', 'steve', function(err, res) {
			err.message.should.equal('lockit - Cannot find username: "steve"');
			done();
		});
	});
});

// Remove users db
after(function(done) {
	adapter.remove('username', 'john', done);
});