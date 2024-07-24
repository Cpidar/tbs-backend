import {
    AbstractBatchJobStrategy,
    BatchJobService,
    CreateBatchJobInput,
    ProductService,
    ProductStatus,
    BatchJob,
    StoreService,
    ProductCategoryService,
    ProductCategory
} from "@medusajs/medusa"
import { WooCommerceRestApiOptions } from "@woocommerce/woocommerce-rest-api"
import { Observable, from, interval, mergeMap, switchMap, takeUntil, takeWhile, tap } from "rxjs"
import WooCategoryService from "src/services/woo-category"
import WooClientService from "src/services/woo-client"
import { EntityManager } from "typeorm"
import { fromFetch } from 'rxjs/fetch';
import { Products } from "woocommerce-rest-ts-api/dist/src/typesANDinterfaces"
import WooProductService from "src/services/woo-product"

class WoocommerceImportStrategy extends AbstractBatchJobStrategy {
    static batchType = "product-import"
    static identifier = "woocommerce-product-import-strategy"

    protected batchJobService_: BatchJobService
    protected manager_: EntityManager
    protected transactionManager_: EntityManager
    protected productService_: WooProductService
    protected client_: WooClientService
    protected wooCategoryService_: WooCategoryService
    protected categoryService_: ProductCategoryService
    protected store_: StoreService

    constructor(
        {
            manager,
            storeService,
            wooProductService,
            wooCategoryService,
            wooClientService,
            productCategoryService,
            batchJobService
        },
        options
    ) {
        super({
            manager,
            storeService,
            wooProductService,
            wooCategoryService,
            wooClientService,
            productCategoryService,
            batchJobService
        })


        this.manager_ = manager
        this.productService_ = wooProductService
        this.wooCategoryService_ = wooCategoryService
        this.client_ = wooClientService
        this.store_ = storeService
        this.categoryService_ = productCategoryService
        this.batchJobService_ = batchJobService
    }

    startPolling() {
        return interval(1000).pipe(
            mergeMap((page) => from(this.client_.get('products', { page: page + 1, per_page: 100, type: "simple" }))),
            switchMap<any, Observable<Products[]>>((response) => response.data),
            tap(console.log),
            takeWhile((data) => data.length < 100),
            switchMap(data => from(data)),
        )
    }

    async prepareBatchJobForProcessing(
        batchJob: CreateBatchJobInput,
        req: Express.Request
    ): Promise<CreateBatchJobInput> {

        const url = process.env.WOO_URL
        const consumerKey = process.env.WOO_CONSUMER_KEY
        const consumerSecret = process.env.WOO_CONSUMER_SECRET
        // const { url, consumerKey, consumerSecret } = batchJob.context as unknown as WooCommerceRestApiOptions
        console.log(batchJob.context)

        this.client_.initialize({ url, consumerKey, consumerSecret })
        return batchJob
    }

    async preProcessBatchJob(batchJobId: string): Promise<void> {
        return this.atomicPhase_(async (manager) => {

            //   await this.shippingProfileService_.createDefault()
            //   await this.shippingProfileService_.createGiftCardDefault()

            // const { data: products } = await this.client_.get('products')


            let count: number = 0
            let breakLoop = false
            let page = 1
            while (!breakLoop) {
                let data = await this.client_.get('products', { page, per_page: 100, type: "simple" })
                // const data = await this.client_.get('products/categories', { page, per_page: 100 })
                    .then((response) => {
                        return response.data
                    })
                    .catch((error) => {
                        console.log(error.response.data);
                    })
                if (data.length === 0 || !data) {
                    breakLoop = true
                } else {
                    count = data.length
                    // const filteredData = data.filter(x => x.id !== 1985)
                    // const categories = await this.wooCategoryService_
                    //     .withTransaction(manager)
                    //     .createCategory(data)


                    const productServiceTx = this.productService_.withTransaction(manager)
                    const resolvedProducts = await Promise.all(
                      data.map(async (product) => {
                        return await productServiceTx.create(product)
                      })
                    )

                    page = page + 1
                }
            }

            const productServiceTx = this.productService_.withTransaction(manager)
            // const resolvedProducts = await Promise.all(
            //   products.map(async (product) => {
            //     return await productServiceTx.create(product)
            //   })
            // )

            // this.startPolling()

            await this.batchJobService_
                .withTransaction(manager)
                .update(batchJobId, {
                    result: {
                        advancement_count: 0,
                        count,
                        stat_descriptors: [
                            {
                                key: "product-import-count",
                                name: "Number of product to import",
                                message:
                                    `${count} product(s) will be imported.`,
                            },
                        ],
                    },
                })




        })
    }


    async processJob(batchJobId: string): Promise<void> {
        // return this.atomicPhase_(async (manager) => {

        //     const categories = await this.categoryService_
        //         .withTransaction(manager)
        //         .listAndCount({})


        //     categories[0].forEach(async category => this.wooCategoryService_
        //         .withTransaction(manager)
        //         .updateCategoryStructure(category)
        //     )

        //     await this.batchJobService_
        //         .withTransaction(manager)
        //         .update(batchJobId, {
        //             result: {
        //                 advancement_count: categories[1],
        //             },
        //         })
        // })
    }

    buildTemplate(): Promise<string> {
        throw new Error("Method not implemented.")
    }
    protected async shouldRetryOnProcessingError(
        batchJob: BatchJob,
        err: unknown
    ): Promise<boolean> {
        return true
    }
    protected async handleProcessingError<T>(
        batchJobId: string,
        err: unknown,
        result: T
    ): Promise<void> {
        // different implementation...
    }
}

export default WoocommerceImportStrategy