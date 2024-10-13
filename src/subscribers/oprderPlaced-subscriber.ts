// import MelipayamakApi from 'melipayamak-api'
import {
    type SubscriberConfig,
    type SubscriberArgs,
    OrderService,
} from "@medusajs/medusa"
import TtlCacheService from "src/services/ttl-cache"

export default async function handleOrderPlaced({
    data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
    process.env
console.log(data)
}

export const config: SubscriberConfig = {
    event: OrderService.Events.PLACED,
    context: {
        subscriberId: 'order-placed-handler',
    },
}

