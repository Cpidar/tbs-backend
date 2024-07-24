
import { ICacheService } from "@medusajs/types"
import { IGNORE_THRESHOLD } from "../utils/const"
import { TransactionBaseService } from "@medusajs/medusa"

class WooCacheService extends TransactionBaseService {

  public cacheService_: ICacheService
  public options_: any

  constructor({ cacheService }, options) {
    super({ cacheService })

    this.options_ = options

    this.cacheService_ = cacheService
  }

  async categoryAdded(wooId, medusaId) {
    return await this.cacheService_.set(`${wooId}`, medusaId)
  }

  async hasCategory(wooId: number) {
    const c = await this.cacheService_.get<string | null>(`${wooId}`)
    console.log(c)
    return c
  }

  async addIgnore(id, side) {
    const key = `sh_${id}_ignore_${side}`
    return await this.cacheService_.set(
      key,
      1,
      this.options_.ignore_threshold || IGNORE_THRESHOLD
    )
  }

  async shouldIgnore(id, action) {
    const key = `sh_${id}_ignore_${action}`
    return await this.cacheService_.get(key)
  }

  async addUniqueValue(uniqueVal, type) {
    const key = `sh_${uniqueVal}_${type}`
    return await this.cacheService_.set(key, 1, 60 * 5)
  }

  async getUniqueValue(uniqueVal, type) {
    const key = `sh_${uniqueVal}_${type}`
    return await this.cacheService_.get(key)
  }
}

export default WooCacheService
