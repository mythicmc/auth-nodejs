#!/usr/bin/env node
import { Redis } from 'ioredis'

const url = process.argv[2] ?? 'redis://localhost:6379'
if (!process.argv[2]) {
  console.log('No URL passed as parameter, using default redis://localhost:6379')
}

const pub = new Redis(url)
const sub = new Redis(url)

await sub.psubscribe('mythicauthservice:request:*')
sub.on('pmessage', (pattern, channel, message) => {
  const permission = channel.split(':')[2]
  console.log(`Received auth request for permission ${permission}, authorising: ${message.trim()}`)
  pub
    .publish(
      `mythicauthservice:response:${permission}`,
      JSON.stringify({ request: message, authorised: true }),
    )
    .catch(err => console.error('Error publishing auth response:', err))
})
