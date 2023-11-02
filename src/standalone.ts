// FIXME: Design API, then drop dependency on the service entirely tbh
import mariadb from 'mariadb'
import sqlLegacy from 'sql-template-tag'

const sql = (strings: TemplateStringsArray, ...values: string[]): [string, unknown[]] => {
  const parsed = sqlLegacy(strings, ...values)
  return [parsed.sql, parsed.values]
}

export default class MythicAuth {
  readonly #pool: mariadb.Pool

  constructor(mysqlConfig: string | mariadb.PoolConfig) {
    this.#pool = mariadb.createPool(mysqlConfig)
  }

  async checkUserPermission(username: string, permission: string): Promise<boolean> {
    // TODO: Get in user's primary group and UUID
    // TODO: Get any secondary groups (group.%) and permissions that apply
    // (split permission by . and append %, e.g. for a.b.c we must check a.*, a.b.* and a.b.c)
    // TODO: Get any secondary group permissions, do this recursively?
    return false
  }

  // TODO: MariaDB backend only
  async checkUserLogin(username: string, password: string): Promise<boolean> {
    const result = await this.#pool.query(
      ...sql`SELECT accounts.playername, accounts.password, accounts.passedtest, deltabans_bans.name
        FROM accounts 
        LEFT JOIN deltabans_bans ON deltabans_bans.name = accounts.playername
        WHERE accounts.playername = ${username} AND accounts.passedtest = 1 AND deltabans_bans.name IS NULL
        LIMIT 1;`,
    )
    if (result.length) {
      // TODO: Check password validity
      return false
    } else return false
  }

  // TODO: MariaDB backend only
  async checkUserExists(username: string): Promise<boolean> {
    const result = await this.#pool.query(
      ...sql`SELECT accounts.playername, accounts.passedtest, deltabans_bans.name
        FROM accounts 
        LEFT JOIN deltabans_bans ON deltabans_bans.name = accounts.playername
        WHERE accounts.playername = ${username} AND accounts.passedtest = 1 AND deltabans_bans.name IS NULL
        LIMIT 1;`,
    )
    return !!result.length
  }

  // TODO: async checkUserPermLogin(username: string, permission: string, password?: string) {}
}
