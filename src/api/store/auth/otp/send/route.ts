import cors from 'cors'
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
import PasswordLessService from "../../../../../services/passwordless"
import TtlCacheService from 'src/services/ttl-cache'

interface BodyType  {
  token: string
  phone: string
  step: 'isResetPassword' | 'isSignUp'
}

export const POST = async (req: MedusaRequest<BodyType>, res: MedusaResponse) => {
  const customerService = req.scope.resolve('customerService')
  const { phone, step } = req.body
  const isResetPassword = step === 'isResetPassword'

  try {

    const passwordLessService: PasswordLessService = req.scope.resolve('passwordlessService')

    await passwordLessService.sendOTP(phone, isResetPassword)
    return res.status(200).json({ status: 200, message: `SMS Sent` })

    // return res.status(201).json({ status: 201, message: 'Email sent', name: customer.first_name, email: customer.email })
  } catch (error) {
    return res.status(404).json({ message: `There was an error sending the email.` })
  }
}

