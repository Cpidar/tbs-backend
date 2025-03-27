import { ICacheService } from "@medusajs/types"
import TTLCache, { Options as TTLCacheOptions } from '@isaacs/ttlcache'
import { Logger } from "@medusajs/medusa"

const DEFAULT_CACHE_TIME = 1000 * 60 * 5

class TtlCacheService implements ICacheService {
    protected readonly ttlCache: TTLCache<string, string>
    protected readonly TTL: number
    protected logger: Logger;
    protected cacheService_: ICacheService

    constructor(
        {
            cacheService,
            logger,
        },
        options: TTLCacheOptions<string, string>
    ) {
        // this.logger = logger
        this.TTL = options.ttl || DEFAULT_CACHE_TIME
        this.cacheService_ = cacheService

        this.ttlCache = new TTLCache({
            ...options,

            // The max number of items to keep in the cache.
            max: options.max || Infinity,

            // how long to live in ms
            ttl: this.TTL,

        });

        this.logger = logger

    }

    async get<T>(cacheKey: string): Promise<T | null> {
        return this.cacheService_.get(cacheKey)
    }

    async set(
        key: string,
        data: string,
        ttl?: number
    ): Promise<any> {
        this.logger.info(`the key ${key} and value ${data} and ttl ${ttl}`)
        this.ttlCache.set(key, data, { ttl })
        const gen = this.ttlCache.keys()
        console.log('cache saved', key, data)
        return this.cacheService_.set(key, data, ttl)

        console.log('hase key', gen.next())
        return this.ttlCache.set(key, data, { ttl })
    }

    async invalidate(key: string): Promise<void> {
        this.cacheService_.invalidate(key)
            .then(() => this.logger.info(`the key ${key} was deleted`))
    }


}

export default TtlCacheService