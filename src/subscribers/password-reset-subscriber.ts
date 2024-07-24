// import MelipayamakApi from 'melipayamak-api'
import {
    type SubscriberConfig,
    type SubscriberArgs,
} from "@medusajs/medusa"
import TtlCacheService from "src/services/ttl-cache"

export default async function PasswordResetSubscriber({
    data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
    const ttlCacheService: TtlCacheService = container.resolve('ttlCacheService')
    console.log(data)
    const { id, email, token } = data
    await ttlCacheService.set(email, token)
}

export const config: SubscriberConfig = {
    event: 'customer.password_reset',
    context: {
        subscriberId: 'customer.password_reset',
    },
}

