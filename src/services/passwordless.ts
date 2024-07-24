import { CustomerService, EventBusService, TransactionBaseService } from '@medusajs/medusa'
import { MedusaError } from 'medusa-core-utils'
import { EntityManager } from 'typeorm'
import jwt from 'jsonwebtoken'
import TtlCacheService from './ttl-cache'


class PasswordlessService extends TransactionBaseService {
  protected manager_: EntityManager
  protected transactionManager_: EntityManager
  private readonly customerService_: CustomerService
  private readonly eventBus_: EventBusService
  private readonly ttlCache: TtlCacheService
  private readonly configModule_: any;
  private readonly jwt_secret: any;
  private options_: any
  private token: string

  constructor(container, options) {
    super(container)
    this.eventBus_ = container.eventBusService
    this.customerService_ = container.customerService
    this.ttlCache = container.ttlCacheService
    this.configModule_ = container.configModule

    const { projectConfig: { jwt_secret } } = this.configModule_
    this.jwt_secret = jwt_secret
  }

  async sendOTP(phone, isSignUp) {
    // const token = jwt.sign({ email }, this.jwt_secret, { expiresIn: '8h' })
    // this.token = Math.floor(100000 + Math.random() * 900000)


    try {
      console.log('from passwordless service', phone)
      return await this.eventBus_.withTransaction(this.manager_)
        .emit('passwordless.login', { phone, isSignUp })
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `There was an error sending the email.`)
    }
  }

  async verifyOTP(token, phone) {

    this.token = await this.ttlCache.get(phone)

    if (await token !== this.token) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Invalid auth credentials.`)
    }

    // if (!decoded.hasOwnProperty('email') || !decoded.hasOwnProperty('exp')) {
    //   throw new MedusaError(MedusaError.Types.INVALID_DATA, `Invalid auth credentials.`)
    // }

    const customer = await this.customerService_.retrieveByPhone(phone).catch(() => null)

    if (!customer) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `There isn't a customer with phone ${phone}.`)
    }

    return customer
  }

}

export default PasswordlessService