import argon2 from 'argon2'
import mariadb from 'mariadb'
import sql from 'sql-template-tag'

export default class MythicAuth {
  readonly #pool: mariadb.Pool
  readonly #lpApiUrl: string

  constructor(mysqlConfig: string | mariadb.PoolConfig, luckpermsApiUrl: string) {
    this.#pool = mariadb.createPool(mysqlConfig)
    this.#lpApiUrl = luckpermsApiUrl
  }

  async #checkUserPermission(username: string, permission: string): Promise<boolean> {
    if (this.#lpApiUrl.startsWith('emulate ')) {
      // In future:
      // - Get user's primary group and UUID.
      // - Get any secondary groups (group.%) and load all permissions for primary/secondary groups.
      // - Find all matching permissions in the global scope.
      // But this has a performance impact... I think, just stick to the REST API.
      return false
    }
    const r1 = await fetch(`${this.#lpApiUrl}/user/lookup?username=${encodeURIComponent(username)}`)
    if (!r1.ok) return false
    const { uniqueId } = (await r1.json()) as { uniqueId: string }
    const r2 = await fetch(`${this.#lpApiUrl}/user/${encodeURIComponent(uniqueId)}/permissionCheck\
?permission=${encodeURIComponent(permission)}`)
    return r2.ok && ((await r2.json()) as { result: string }).result === 'true'
  }

  async #checkUserLogin(username: string, password: string): Promise<boolean> {
    const result = await this.#pool.query(
      sql`SELECT accounts.playername, accounts.password, accounts.passedtest, deltabans_bans.name
        FROM accounts
        LEFT JOIN deltabans_bans ON deltabans_bans.name = accounts.playername
        WHERE accounts.playername = ${username} AND accounts.passedtest = 1 AND deltabans_bans.name IS NULL
        LIMIT 1;`,
    )
    if (result.length) {
      const hash = result[0].password
      // We don't support legacy Whirlpool hashes
      return hash.startsWith('$argon2id') ? await argon2.verify(hash, password) : false
    } else return false
  }

  async #checkUserExists(username: string): Promise<boolean> {
    const result = await this.#pool.query(
      sql`SELECT accounts.playername, accounts.passedtest, deltabans_bans.name
        FROM accounts
        LEFT JOIN deltabans_bans ON deltabans_bans.name = accounts.playername
        WHERE accounts.playername = ${username} AND accounts.passedtest = 1 AND deltabans_bans.name IS NULL
        LIMIT 1;`,
    )
    return !!result.length
  }

  async check(
    username: string,
    permission?: string | null,
    password?: string | null,
  ): Promise<boolean> {
    if (password === '' || permission === '') return false // Safety check
    if (!permission && !password) return await this.#checkUserExists(username)
    return (
      (!password || (await this.#checkUserLogin(username, password))) &&
      (!permission || (await this.#checkUserPermission(username, permission)))
    )
  }
}
