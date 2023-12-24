import ioredis from 'ioredis'

export default class MythicAuth {
  readonly #pub: ioredis.Redis
  readonly #sub: ioredis.Redis
  readonly #promises = new Map<
    string,
    {
      resolve: (value: boolean) => void
      timeout: NodeJS.Timeout
    }
  >()

  constructor(...redisUrl: ConstructorParameters<typeof ioredis.Redis>) {
    this.#pub = new ioredis.Redis(...redisUrl)
    this.#sub = new ioredis.Redis(...redisUrl)
  }

  async connect(namespace: string, force?: boolean): Promise<void> {
    if (this.#sub.mode === 'subscriber' && !force) {
      return // Don't reconnect if already connected.
    }
    await this.#sub.psubscribe(`mythicauthservice:response:${namespace}`)
    this.#sub.on('pmessage', (pattern, channel, message) => {
      const permission = channel.split(':')[2]
      const { request, authorised } = JSON.parse(message)
      const promise = this.#promises.get(permission + ' ' + request)
      if (promise) {
        clearTimeout(promise.timeout)
        this.#promises.delete(request)
        promise.resolve(authorised)
      }
    })
  }

  async check(
    username: string,
    permission: string,
    password?: string | null,
  ): Promise<boolean> {
    if (password === '') return false // Return false if empty, undefined is a different case

    const request = JSON.stringify({ username, password })
    const promise = new Promise<boolean>((resolve, reject) => {
      this.#promises.set(permission + ' ' + request, {
        resolve,
        timeout: setTimeout(() => {
          reject(new Error('Timeout when waiting for auth response from Minecraft server!'))
        }, 5000),
      })
    })
    await this.#pub.publish(`mythicauthservice:request:${permission}`, request)
    return await promise
  }
}
