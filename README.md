# Lockit Redis adapter

Redis adapter for [Lockit](https://github.com/zeMirco/lockit).

## Installation

`npm install lockit-redis-adapter`

```js
var adapter = require('lockit-redis-adapter');
```

## Configuration

The following settings are required.

```js
exports.db = 'redis';
exports.dbip = '127.0.0.1';
exports.dbport = 6379;
exports.dbpass = 'mypassword'; //Optional
exports.dbPrefix = 'users';
exports.signupTokenExpiration = 259200000; // 5 days
```

## Features

### 1. Create user

`adapter.save(name, email, pass, callback)`

 - `name`: String - i.e. 'john'
 - `email`: String - i.e. 'john@email.com'
 - `pass`: String - i.e. 'password123'
 - `callback`: Function - `callback(err, user)` where `user` is the new user now in our database.

The `user` object has the following properties

 - `email`: email that was provided at the beginning
 - `hash`: hashed password using [bcrypt](https://github.com/ncb000gt/node.bcrypt.js/)
 - `signupTimestamp`: Date object to remember when the user signed up
 - `signupToken`: unique token sent to user's email for email verification
 - `signupTokenExpires`: Date object usually 24h ahead of `signupTimestamp`
 - `username`: username chosen during sign up
 - `failedLoginAttempts`: save failed login attempts during login process, default is `0`

```js
adapter.save('john', 'john@email.com', 'secret', function(err, user) {
  if (err) console.log(err);
  console.log(user);
  // {
  //  username: 'john',
  //  email: 'john@email.com',
  //  signupToken: 'ef32a95a-d6ee-405a-8e4b-515b235f7c54',
  //  signupTimestamp: Wed Jan 15 2014 19:08:27 GMT+0100 (CET),
  //  signupTokenExpires: Wed Jan 15 2014 19:08:27 GMT+0100 (CET),
  //  failedLoginAttempts: 0,
  //  hash: '$2a$10$1IpbBVnhaNNAymV3HXO/z.632Knz27Od.oKpO1YoFnLlUjJMNcCEO',
  // }
});
```

### 2. Find user

`adapter.find(match, query, callback)`

 - `match`: String - one of the following: 'username', 'email' or 'signupToken'
 - `query`: String - corresponds to `match`, i.e. 'john@email.com'
 - `callback`:  Function - `callback(err, user)`
 
```js
adapter.find('username', 'john', function(err, user) {
  if (err) console.log(err);
  console.log(user);
  // {
  //  username: 'john',
  //  email: 'john@email.com',
  //  signupToken: 'fe1a14ca-e614-4eb5-9dff-d5d947b5ba19',
  //  signupTimestamp: Wed Jan 15 2014 19:10:53 GMT+0100 (CET),
  //  signupTokenExpires: Wed Jan 15 2014 19:10:53 GMT+0100 (CET),
  //  failedLoginAttempts: 0,
  //  hash: '$2a$10$jFcGpdDKk/hqhP93VQGcce5zgoWVPGi7bQvpjupaOUKqIVBV.yI1e',
  // }
});
```

### 3. Update user

`adapter.update(user, callback)`

 - `user`: Object - must have `_id` and `_rev` properties
 - `callback`: Function - `callback(err, user)` - `user` is the updated user object
 
```js
// get a user from db first
adapter.find('username', 'john', function(err, user) {
  if (err) console.log(err);
  
  // add some new properties to our existing user
  user.newKey = 'and some value';
  user.hasBeenUpdated = true;
  
  // save updated user to db
  adapter.update(user, function(err, user) {
    if (err) console.log(err);
    // ...
  });
});
```

### 4. Remove user

`adapter.remove(match, query, callback)`

 - `match`: String - one of the following: 'username', 'email' or 'signupToken'
 - `query`: String - corresponds to `match`, i.e. `john@email.com`
 - `callback`: Function - `callback(err, res)` - `res` is `true` if everything went fine
 
```js
adapter.remove('username', 'john', function(err, res) {
  if (err) console.log(err);
  console.log(res);
  // true
});
```

## Test

`grunt`

## License

[MIT](http://www.tldrlegal.com/license/mit-license)