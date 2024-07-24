import jwt from 'jsonwebtoken'
import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/medusa"
// import { projectConfig } from '../../../../medusa-config'

// const corsOptions = {
//   origin: projectConfig.store_cors.split(','),
//   credentials: true
// }
import TtlCacheService from 'src/services/ttl-cache'
import { retry } from '../../../../../utils/retryWithDelay'

interface BodyType  {
  token: string
  phone: string
  step: 'isResetPassword' | 'isSignUp'
}

export const POST = async (req: MedusaRequest<BodyType>, res: MedusaResponse) => {
  const { token, phone, step } = req.body
  const { projectConfig } = req.scope.resolve('configModule')
  const ttlCache: TtlCacheService = req.scope.resolve('ttlCacheService')
  const customerService = req.scope.resolve('customerService')
  const isResetPassword = step === 'isResetPassword'


  if (!token) {
    return res.status(403).json({ message: 'The user cannot be verified' })
  }

  try {
    const refToken = await ttlCache.get(phone as string)
    console.log("refToken", refToken)
    const isTokenValid = token === refToken

    if (!isTokenValid) {
      return res.status(401).json({ status: 401, message: `the otp token is not valid.` })
    }

    const loggedCustomer = await customerService.retrieveByPhone(phone).catch(() => null)

    if (loggedCustomer && isResetPassword) {
      console.log(loggedCustomer.email)
      const token = await retry(() => ttlCache.get(loggedCustomer.email).then(r => r ? r : Promise.reject()), 10)
      // const url = await new Promise(resolve => setTimeout(() => resolve(ttlCache.get(loggedCustomer.email)), 1000))
      return res.status(200).json({ token })
    }

    return res.status(404).json({ status: 404, message: `Customer with ${phone} was not found. Please sign up instead.` })

    // req.session.customer_id = loggedCustomer.customer?.id
    // req.session.jwt_store = jwt.sign(
    //   { customer_id: loggedCustomer.id },
    //   projectConfig.jwt_secret!,
    //   { expiresIn: '30d' }
    // )

    // return res.status(200).json({ ...loggedCustomer })
  } catch (error) {
    console.log(error)
    return res.status(403).json({ message: 'The user cannot be verified' })
  }
}
