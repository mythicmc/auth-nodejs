# auth-nodejs

Node.js client for MythicAuthService. Requires Node.js 18 and newer.

## Usage

```js
import MythicAuth from '@mythicmc/auth'; // or @mythicmc/auth/standalone.js

const client = new MythicAuth('redis://localhost:6379'); // or MySQL URL or options if using standalone
// Connecting is not required on standalone, but is required on the Redis client.
await client.connect('app.*') // The permission namespace within which you check perms, e.g. app.use (if only checking 1 perm), app.* or even *

// The service will check if the user has the permission *and* if the password matches the user's.
// The password is optional, if not passed, only the permission check will be done.
// The permission is optional only if using the standalone client.
console.log(await client.check('username', 'permission', 'password'))
```
