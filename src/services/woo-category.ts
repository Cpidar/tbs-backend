import { EntityManager } from "typeorm"
import { ProductCategory, ProductCategoryService, ProductCollectionService, ProductService, ProductVariantService, ShippingProfileService, StoreService, TransactionBaseService } from "@medusajs/medusa"
import WooClientService from "./woo-client"
import WooCacheService from "./woo-cache"
import WooProductService from "./woo-product"
import { CreateProductCategoryInput } from "@medusajs/medusa/dist/types/product-category"
import { ProductsCategories } from "woocommerce-rest-ts-api/dist/src/typesANDinterfaces"
import { slug } from "../utils/slug"

class WooCategoryService extends TransactionBaseService {

  public manager_: EntityManager
  public productService_: WooProductService
  public medusaProductService_: ProductService
  public productVariantService_: ProductVariantService
  public shippingProfileService_: ShippingProfileService
  public woo_: WooClientService
  public cacheService_: WooCacheService
  public storeService_: StoreService
  // public collectionService_: ProductCollectionService
  public categoryServic_: ProductCategoryService

  public options: any


  constructor(
    {
      manager,
      wooProductService,
      productCategoryService,
      productService,
      storeService,
      wooCacheService,
    },
    options
  ) {
    super({
      manager,
      wooProductService,
      productCategoryService,
      productService,
      storeService,
      wooCacheService,
    })

    this.options = options

    this.manager_ = manager
    this.productService_ = wooProductService
    this.categoryServic_ = productCategoryService
    this.storeService_ = storeService
    this.cacheService_ = wooCacheService
    this.medusaProductService_ = productService
  }


  async createCategory(wooCategories: ProductsCategories[]) {
    return this.atomicPhase_(async (manager) => {
      console.log(wooCategories)
      const normalizedCollections = this.normalizCategories_(wooCategories)

      const treeCatCreate = async (cat: CreateProductCategoryInput) => {

        if (!cat.parent_category_id) {
          return await this.categoryServic_
            .withTransaction(manager)
            .create(cat)
            .then(c => {
              const cache = this.cacheService_.categoryAdded(c.metadata?.woo_id, c.id)
              return c
            })
        } else {

          let parent_category = await this.categoryServic_
            .retrieve(cat.parent_category_id)
            .catch((_) => undefined)
          console.log(parent_category)
          if (!parent_category) {
            const parent = normalizedCollections.find(w => (w as any).id === cat.parent_category_id)
            treeCatCreate(parent)
          } else {
            return await this.categoryServic_
              .create(cat)
              .then(c => {
                const cache = this.cacheService_.categoryAdded(c.metadata?.woo_id, c.id)
                return c
              })
              .catch(e => console.log(e))
          }
        }
      }

      // const result = [] as ProductCategory[]

      const result = await Promise.all(
        // for (const nc of normalizedCollections) {
        normalizedCollections.map(async nc => {
          let category = await this.categoryServic_
            .retrieve(nc.id)
            .catch((_) => undefined)

          if (!category) {
            // category = await treeCatCreate(nc)
            category = await this.categoryServic_
              .create(nc)
              .then(c => {
                setTimeout(() => console.log(c.id + ' created'), 100)
                const cache = this.cacheService_.categoryAdded(c.metadata?.woo_id, c.id)
                return c
              })
          }


          const cached = await this.cacheService_.hasCategory(nc.metadata?.woo_id as number)

          return category
          // result.push(category)
        })
      )

      return result
    })
  }

  async updateCategoryStructure(category: ProductCategory) {
    return this.atomicPhase_(async (manager) => {
      // return Promise.all(
      // categories.map(async category => {
      if (category.metadata?.woo_parent !== 0) {
        // const parentCatId = await this.cacheService_.hasCategory(category.metadata.woo_parent as number)
        const parentCatId = `${category.metadata?.woo_parent}`
        // if (parentCatId) {

        // const parentCat = await this.categoryServic_
        //   // .withTransaction(manager)
        //   .retrieve(parentCatId)

        await this.categoryServic_
          .withTransaction(manager)
          .update(category.id, {
            // parent_category: parentCat,
            parent_category_id: parentCatId,
          })
          .then(a => console.log(a.id, '  ', a.rank))
          .catch(e => console.log(e.detail))
        // return parentCat
        // }
      }
      // })
      // )
    })
  }
  // ts-ignore
  normalizCategories_(wooCategories: ProductsCategories[]): (CreateProductCategoryInput & { id: string })[] {  
    return wooCategories.map(wooCat => {
      const rank = wooCat.parent === 0 ? 0 : 1 
      return {
        id: `${wooCat.id}`,
        name: wooCat.name,
        // handle: `${slug(wooCat.name)}-${Math.random() * (1000 - 1) + 1}`,
        handle: wooCat.slug !== decodeURIComponent(wooCat.slug) ? decodeURI(wooCat.slug) : wooCat.slug,
        is_active: true,
        // rank: 0,
        // description: wooCat.description,
        parent_category_id: wooCat.parent === 0 ? null : `${wooCat.parent}`,
        metadata: {
          woo_id: wooCat.id,
          woo_parent: wooCat.parent,
        },
      }
    }) as unknown as (CreateProductCategoryInput & { id: string })[]
  }

}

export default WooCategoryService
