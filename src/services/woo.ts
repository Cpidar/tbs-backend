import { ShippingProfileService, StoreService, TransactionBaseService } from "@medusajs/medusa"
import { EntityManager } from "typeorm"
import WooProductService from "./woo-product"
import WooClientService from "./woo-client"
import WooCategoryService from "./woo-category"

class WooService extends TransactionBaseService {

  public manager_: EntityManager
  public categoryService_: WooCategoryService
  public options_: any
  public store_: StoreService
  private shippingProfileService_: ShippingProfileService
  private productService_: WooProductService
  private client_: WooClientService
  constructor(
    {
      manager,
      shippingProfileService,
      storeService,
      wooProductService,
      wooCategoryService,
      wooClientService,
    },
    options
  ) {
    super({
      manager,
      shippingProfileService,
      storeService,
      wooProductService,
      wooClientService,
    })

    this.options_ = options

    this.manager_ = manager
    this.shippingProfileService_ = shippingProfileService
    this.productService_ = wooProductService
    this.categoryService_ = wooCategoryService
    this.client_ = wooClientService
    this.store_ = storeService
  }

  async importWoo() {
    return this.atomicPhase_(async (manager) => {

      //   await this.shippingProfileService_.createDefault()
      //   await this.shippingProfileService_.createGiftCardDefault()

      // const { data: products } = await this.client_.get('products')



      let breakLoop = false
      let page = 1
      while (!breakLoop) {
        // let data = await this.client_.get('products', { page, per_page: 100, type: "simple" })
        const data = await this.client_.get('products/categories', { page, per_page: 100 })
          .then((response) => {
            return response.data
          })
          .catch((error) => {
            console.log(error.response.data);
          })
        if (data.length === 0 || !data) {
          breakLoop = true
        } else {
          const filteredData = data.filter(x => x.id !== 1985)
          const categories = await this.categoryService_
            .withTransaction(manager)
            .createCategory(data)

          const treeCategories = await Promise.all(
            categories.map(async category => this.categoryService_
              .updateCategoryStructure(category)
            )
          )

          // const productServiceTx = this.productService_.withTransaction(manager)
          // const resolvedProducts = await Promise.all(
          //   data.map(async (product) => {
          //     return await productServiceTx.create(product)
          //   })
          // )

          page = page + 1
        }
      }

      // const productServiceTx = this.productService_.withTransaction(manager)
      // const resolvedProducts = await Promise.all(
      //   products.map(async (product) => {
      //     return await productServiceTx.create(product)
      //   })
      // )




    })
  }
}

export default WooService