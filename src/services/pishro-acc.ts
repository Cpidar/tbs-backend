import { OrderService, OrderStatus, ProductVariantService, ShippingProfileService, StoreService, TransactionBaseService } from "@medusajs/medusa"
import { fetchOTP } from "../utils/fetch"
import { EntityManager } from "typeorm"

class PishroAccService extends TransactionBaseService {

  public manager_: EntityManager
  public options_: any
  public store_: StoreService
  public productVariantService_: ProductVariantService
  public orderService_: OrderService
  public pishroApiUrl: string

  constructor(
    {
      manager,
      productVariantService,
      orderService,
      storeService,
    },
    options
  ) {
    super({
      manager,
      productVariantService,
      storeService,
    })

    this.options_ = options

    this.manager_ = manager
    this.store_ = storeService
    this.productVariantService_ = productVariantService
    this.orderService_ = orderService
    this.pishroApiUrl = 'https://api.core.pishroacc.com/api/App/CallPishro'

  }

  async getToken({ appcode, username, password }) {
    console.log(JSON.stringify({
      entity: {
        username,
        appcode,
        password
      }
    }))
    const body = JSON.stringify({
      entity: {
        username,
        appcode,
        password
      }
    })
    try {
      // const res = await fetch("https://api.core.pishroacc.com/api/User/Login", {
      //   method: "POST",
      //   headers: {'content-type': 'application/json'},
      //   body: '{"entity":{"username":"011931","appcode":"011931","password":"197967957424"}}'
      // })

      const res: any = await fetchOTP('api.core.pishroacc.com', '/api/User/Login', body)

      console.log(res.entity.token)
      // const data = await res.json()

      return res.entity.token
    } catch (e) {
      console.error(e)
    }
  }
  //   {
  //     "RequestId": "8a9cebbb-87a7-40e3-898d-897f928eb42d",
  //     "req_id": "47e0e9e1-3680-4b53-9542-2e356989a8e7",
  //     "IsSuccess": "True",
  //     "Message": "",
  //     "FinancialPeriodId": "_72W0WNUPS",
  //     "FinancialPeriodName": "دوره مالي 1403",
  //     "Products": [
  //         {
  //             "Code": "000690",
  //             "Name": "پايه بست کمربندي 19*19",
  //             "GroupId": "011",
  //             "Unit": "عدد",
  //             "Coefficient": "1",
  //             "PurchasePrice": "0",
  //             "Price": "5500",
  //             "Price2": "0",
  //             "Price3": "0",
  //             "Barcode": "",
  //             "VatRate": "10",
  //             "ProductUnits": [
  //                 {
  //                     "Units": "عدد",
  //                     "Coefficient": "1",
  //                     "IsDefault": 1
  //                 },
  //                 {
  //                     "Units": "بسته",
  //                     "Coefficient": "100/00000",
  //                     "IsDefault": 0
  //                 }
  //             ],
  //             "ProductStocks": [
  //                 {
  //                     "StockCode": "1",
  //                     "Stock": "0/00000"
  //                 }
  //             ]
  //         }
  //     ],
  //     "ProductGroups": [
  //         {
  //             "Code": "000",
  //             "Name": "تمام موارد"
  //         },
  //         {
  //             "Code": "001",
  //             "Name": "چينت"
  //         },
  //         {
  //             "Code": "002",
  //             "Name": "پارس فانال"
  //         },
  //         {
  //             "Code": "003",
  //             "Name": "هدايت الکتريک"
  //         },
  //         {
  //             "Code": "004",
  //             "Name": "شيوا امواج"
  //         },
  //         {
  //             "Code": "005",
  //             "Name": "شي کاريزما"
  //         },
  //         {
  //             "Code": "006",
  //             "Name": "سيمکان"
  //         },
  //         {
  //             "Code": "007",
  //             "Name": "دمنده"
  //         },
  //         {
  //             "Code": "008",
  //             "Name": "هادي نور گستر"
  //         },
  //         {
  //             "Code": "009",
  //             "Name": "رعد الکتريک"
  //         },
  //         {
  //             "Code": "010",
  //             "Name": "سرسيم و وايرشو"
  //         },
  //         {
  //             "Code": "011",
  //             "Name": "لوله،اتصالات و بست"
  //         },
  //         {
  //             "Code": "012",
  //             "Name": "کابلشو کلوته"
  //         },
  //         {
  //             "Code": "013",
  //             "Name": "پارت الکتريک"
  //         },
  //         {
  //             "Code": "014",
  //             "Name": "فرحان الکتريک"
  //         },
  //         {
  //             "Code": "015",
  //             "Name": "سه راهي،محافظ،کليد و دوشاخه"
  //         },
  //         {
  //             "Code": "016",
  //             "Name": "ايران الکتريک"
  //         },
  //         {
  //             "Code": "017",
  //             "Name": "اسکلت تابلو،جعبه و داکت"
  //         },
  //         {
  //             "Code": "018",
  //             "Name": "پي ال سي،اينورتر،کنترل کننده"
  //         },
  //         {
  //             "Code": "019",
  //             "Name": "سيم و کابل"
  //         },
  //         {
  //             "Code": "020",
  //             "Name": "سنسور،ترموستات و تجهيزات مشعل"
  //         },
  //         {
  //             "Code": "021",
  //             "Name": "شمش،ترمينال،گلند،نوار فرم و ريل"
  //         },
  //         {
  //             "Code": "022",
  //             "Name": "چسب،آپارات،روکش حرارتي"
  //         },
  //         {
  //             "Code": "023",
  //             "Name": "شستي،ميکروسوييچ و کليد هاي صنعتي"
  //         },
  //         {
  //             "Code": "024",
  //             "Name": "ابزار آلات"
  //         },
  //         {
  //             "Code": "025",
  //             "Name": "لامپ ، ريسه و نصبيات"
  //         },
  //         {
  //             "Code": "026",
  //             "Name": "دوربين،دزدگير،ريموت و تجهيزات"
  //         },
  //         {
  //             "Code": "027",
  //             "Name": "مقره و سيني کابل"
  //         },
  //         {
  //             "Code": "028",
  //             "Name": "آيفون و وسايل ساختماني"
  //         },
  //         {
  //             "Code": "029",
  //             "Name": "متفرقه"
  //         },
  //         {
  //             "Code": "030",
  //             "Name": "تجهيزات برق صنعتي"
  //         },
  //         {
  //             "Code": "031",
  //             "Name": "خزر فن"
  //         },
  //         {
  //             "Code": "032",
  //             "Name": "لوستر و تزيينات"
  //         }
  //     ],
  //     "Stocks": [
  //         {
  //             "StockCode": 1,
  //             "StockRoom": "انبار اصلي"
  //         }
  //     ]
  // }

  async getPorductsData(token: string) {

    const LIMIT = 1000
    let products = []
    let breakLoop = false
    let page = 1
    while (!breakLoop) {
      const body = this.generateProductRequestBody({ Limit: LIMIT, Offset: (page - 1) * LIMIT })

      const res: any = await fetchOTP('api.core.pishroacc.com', '/api/App/CallPishro', body, token)

      const data = JSON.parse(res.responseBody)?.Products
      console.log(data.count)
      if (data.length === 0 || !data) {
        breakLoop = true
      }
      products = [...products, ...data]
      page++
    }

    // async exportOrder() {
    //   const [orders, count] = await this.orderService_.listAndCount({
    //     status: OrderStatus.PENDING
    //   })

    //   if (!count) {
    //     return null
    //   }

    //   orders.forEach(async (order) => {
    //     // send orders to pishro
    //     fetch(this.pishroApiUrl, {
    //       method: 'POST',
    //       body: ''
    //     })

    //     if (ok) {
    //       await this.orderService_.completeOrder(order.id)
    //     }
    //   })
    console.log(products.length)
    return products

  }

  generateProductRequestBody({ Limit, Offset }) {
    const body = {
      requestBody: {
        OperatorId: "000000",
        FinancialPeriodId: 0,
        FinancialPeriodName: 0,
        RequestProductFilter: {
          Barcode: "",
          IsFull: false,
          Limit,
          Offset,
          ProductCode: "",
          ProductGroupId: "0",
          RequiredGroups: true,
          RequiredStock: true,
          Search: "",
          SendStock: true,
          SendUnit: true,
          SortType: 0,
          StockCode: "",
          StockStatus: 0
        },
        RequestType: 3,
        status: 0,
        Type: 0,
        Id: "00000000-0000-0000-0000-000000000000",
        RequestId: "8a9cebbb-87a7-40e3-898d-897f928eb42d"
      },
      waitingTimePeriod: 25,
      methodName: "Broadcast"
    }

    return JSON.stringify(body)

  }
}

export default PishroAccService