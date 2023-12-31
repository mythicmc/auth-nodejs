# auth-nodejs

Node.js client for MythicAuthService. Requires Node.js 18 and newer.

## Installation

```bash
npm install @mythicmc/auth
# or
yarn add @mythicmc/auth
```

## Usage

```js
import MythicAuth from '@mythicmc/auth'; // or @mythicmc/auth/standalone.js

const client = new MythicAuth('redis://localhost:6379');
// or MySQL URL/options + LuckPerms HTTP API URL if using standalone, e.g.
const client = new MythicAuth('mysql://localhost:3306', 'http://localhost:8080');

// This step is only required with the Redis client, whereas standalone connects automatically.
await client.connect('app.*') // The permission namespace within which you check perms, e.g. app.use (if only checking 1 perm), app.* or even *

// The service will check if the user has the permission *and* if the password matches the user's.
// The password is optional, if not passed, only the permission check will be done.
// The permission is optional *only* if using the standalone client.
console.log(await client.check('username', 'permission', 'password'))
```

This package also comes with a dummy version of the Redis service, which can be used for testing purposes.

```bash
npx @mythicmc/auth # optionally, Redis URL can be passed as arg
```
