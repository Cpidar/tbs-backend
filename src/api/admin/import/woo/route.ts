import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/medusa"

import { WooCommerceRestApiOptions } from '@woocommerce/woocommerce-rest-api'
import WooService from 'src/services/woo'
import WooClientService from 'src/services/woo-client'


export const POST = async (req: MedusaRequest<WooCommerceRestApiOptions>, res: MedusaResponse) => {
    const wooService: WooService = req.scope.resolve('wooService')
    const wooClientService: WooClientService = req.scope.resolve('wooClientService')
    const options = req.body

    const url = options.url || process.env.WOO_URL
    const consumerKey = options.consumerKey || process.env.WOO_CONSUMER_KEY
    const consumerSecret =options.consumerSecret || process.env.WOO_CONSUMER_SECRET


    wooClientService.initialize({ url, consumerKey, consumerSecret })
    wooService.importWoo()

    
    return res.status(201).json({ status: 201, message: 'Email sent' })
  // } catch (error) {
  //   return res.status(404).json({ message: `There was an error sending the email.` })
  // }
}

