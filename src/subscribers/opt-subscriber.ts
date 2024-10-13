// import MelipayamakApi from 'melipayamak-api'
import {
    type SubscriberConfig,
    type SubscriberArgs,
} from "@medusajs/medusa"
import TtlCacheService from "src/services/ttl-cache"
import { fetchOTP } from "../utils/fetch";

export default async function PasswordLessSubscriber({
    data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
    const ttlCacheService: TtlCacheService = container.resolve('ttlCacheService')
    const { phone } = data
    const body = JSON.stringify({
        to: phone
    });
    console.log('otp-subscriber', phone)
    try {
        // const res = { code: '4198' }
        const res: any = await fetchOTP('console.melipayamak.com', '/api/send/otp/d2a06968057f4cdf80c0a719d815e24b', body)

        // node version 22
        // const res: any = await fetch("https://console.melipayamak.com/api/send/otp/d2a06968057f4cdf80c0a719d815e24b", {
        //     method: "POST",
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Content-Length': data.length
        //     },
        //     body
        // })
        if (res?.code) {
            console.log('request sms: ', phone, res.code)
            ttlCacheService.set(`${phone}`, res.code, 120)
            console.log(await ttlCacheService.get(phone))
        } else {
            console.log(res)
        }
    } catch (e) {
        console.error(e)
    }

    console.log(data)
    // const options_ = pluginOptions || {
    //     username: '9386097061',
    //     password: 'Zxc**123456',
    //     bodyId: '189936'
    // }
    // const melipayamakApi_ = new MelipayamakApi(options_.username || '', options_.password || '')
    // const smsSoap = melipayamakApi_.sms('soap')

    // const { token, phone } = data
    // smsSoap.sendByBaseNumber([token], phone, options_.bodyId)
    // smsSoap.sendByBaseNumber([token], phone, options_.bodyId)

}

export const config: SubscriberConfig = {
    event: 'passwordless.login',
    context: {
        subscriberId: 'passwordless.login',
    },
}

