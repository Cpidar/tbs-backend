import WooCommerceRestApi, { WooCommerceRestApiOptions } from "@woocommerce/woocommerce-rest-api";

import { TransactionBaseService } from "@medusajs/medusa";

class WooClientService extends TransactionBaseService {

    public client_: WooCommerceRestApi
    public options_: WooCommerceRestApiOptions
    constructor({ }, options: WooCommerceRestApiOptions) {
        super({})

        this.options_ = options

    }
    
    initialize(options = this.options_) {
        this.client_ = new WooCommerceRestApi(options)
    }

    get(endpoint: string , params?: any) {
        return this.client_.get(endpoint, params)
    }

    delete(endpoint: string, params: any) {
        return this.client_.delete(endpoint, params)
    }

    post(endpoint: string, data: any, params?: any) {
        return this.client_.post(endpoint, data, params)
    }

    put(endpoint: string, data: any, params?: any) {
        return this.client_.put(endpoint, data, params)
    }

    async getAllData(endpoint: string) {
            let allData = []
            let breakLoop = false
            let page = 1
            while (!breakLoop) {
                const Data = await this.get(endpoint, { page })
                    .then((response) => {
                        return response.data
                    })
                    .catch((error) => {
                        console.log(error.response.data);
                    })
                if (Data.length === 0 || !Data){
                    breakLoop = true
                } else {
                    allData = allData.concat(Data)
                    page = page + 1
                }
            }
        
            return allData
    }
}

export default WooClientService
