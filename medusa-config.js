const { Product } = require("@medusajs/medusa");
const dotenv = require("dotenv");
const { title } = require("process");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads", // optional
      backend_url: "https://tabeshelecshop-api.liara.run", // optional
    },
  },
  // {
  //   resolve: `medusa-file-s3`,
  //   options: {
  //       s3_url: process.env.S3_URL,
  //       bucket: process.env.S3_BUCKET,
  //       region: process.env.S3_REGION,
  //       access_key_id: process.env.S3_ACCESS_KEY_ID,
  //       secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
  //       cache_control: process.env.S3_CACHE_CONTROL,
  //       // optional
  //       download_file_duration:
  //         process.env.S3_DOWNLOAD_FILE_DURATION,
  //       prefix: process.env.S3_PREFIX,
  //       aws_config_object: {
  //         endpoint: process.env.S3_ENDPOINT
  //       }
  //   },
  // },
  {
    resolve: `medusa-plugin-meilisearch`,
    options: {
      // config object passed when creating an instance
      // of the MeiliSearch client
      config: {
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_API_KEY,
      },
      settings: {
        products: {
          indexSettings: {
            filterableAttributes: [
              "categories.handle",
              "variants.prices.amount",
              "variants.inventory_quantity",
            ],
            sortableAttributes: [
              "title",
              "created_at",
              "variants.prices.amount",
            ],
            searchableAttributes: ["title", "description", "variant_sku"],
            displayedAttributes: [
              "id",
              "title",
              "description",
              "variant_sku",
              "thumbnail",
              "handle",
            ],
          },
          primaryKey: "id",
          // transformer: (product) => ({
          //   id: product.id,
          //   created_at: product.created_at,
          //   title: product.title,
          //   description: product.description,
          //   variant_sku: product.variant_sku,
          //   thumbnail: product.thumbnail,
          //   handle: product.handle,
          //   inStock: product.variants.some(
          //     (v) => v.inventory_quantity && v.inventory_quantity > 0
          //   ) ? 1 : 0,
          //   categories: product.categories.map(c => c.handle),
          //   variants:  product.variants.map(v => ({ id, title, inventory_quantity, sku, manage_inventory, prices })),
          //   cheapestPrice: product.variants.flatMap(v => v.prices).map(p => p.amount).sort((a, b) => a - b)[0]
          //   // include other attributes as needed
          // }),
        },
      },
    },
  },
  // {
  //   resolve: `medusa-plugin-abandoned-cart`,
  //   /** @type {import('medusa-plugin-abandoned-cart').PluginOptions} */
  //   options: {
  //     sendgridEnabled: true,
  //     from: process.env.SENDGRID_FROM,
  //     enableUI: true,
  //     subject: "You have something in your cart",
  //     templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
  //     days_to_track: 7,
  //     set_as_completed_if_overdue: true,
  //     max_overdue: "2h",
  //     localization: {
  //       fr: {
  //         subject: "Vous avez quelque chose dans votre panier",
  //         templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
  //       },
  //       pl: {
  //         subject: "Masz coś w koszyku",
  //         templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
  //       },
  //       en: {
  //         subject: "You have something in your cart",
  //         templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
  //       },
  //     },
  //     intervals: [
  //       {
  //         interval: "1h",
  //         subject: "You have something in your cart",
  //         templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
  //         localization: {
  //           fr: {
  //             subject: "Vous avez quelque chose dans votre panier",
  //             templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
  //           },
  //           pl: {
  //             subject: "Masz coś w koszyku",
  //             templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
  //           },
  //           en: {
  //             subject: "You have something in your cart",
  //             templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
  //           },
  //         },
  //       },
  //       {
  //         interval: "1d",
  //         subject: "You have something in your cart",
  //         templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
  //         localization: {
  //           fr: {
  //             subject: "Vous avez quelque chose dans votre panier",
  //             templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
  //           },
  //           pl: {
  //             subject: "Masz coś w koszyku",
  //             templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
  //           },
  //           en: {
  //             subject: "You have something in your cart",
  //             templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
  //           },
  //         },
  //       },
  //       {
  //         interval: "5d",
  //         subject: "You have something in your cart",
  //         templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
  //         localization: {
  //           fr: {
  //             subject: "Vous avez quelque chose dans votre panier",
  //             templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_FR,
  //           },
  //           pl: {
  //             subject: "Masz coś w koszyku",
  //             templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE_PL,
  //           },
  //           en: {
  //             subject: "You have something in your cart",
  //             templateId: process.env.SENDGRID_ABANDONED_CART_TEMPLATE,
  //           },
  //         },
  //       },
  //     ],
  //   },
  // },
  // {
  //   resolve: "medusa-plugin-strapi-ts",
  //   options: {
  //     strapi_protocol: process.env.STRAPI_PROTOCOL,
  //     strapi_host: process.env.STRAPI_SERVER_HOSTNAME,
  //     strapi_port: process.env.STRAPI_PORT,
  //     strapi_secret: process.env.STRAPI_SECRET,
  //     strapi_default_user: {
  //         username: process.env.STRAPI_MEDUSA_USER,
  //         password: process.env.STRAPI_MEDUSA_PASSWORD,
  //         email: process.env.STRAPI_MEDUSA_EMAIL,
  //         confirmed: true,
  //         blocked: false,
  //         provider: "local",
  //     },
  //     strapi_admin: {
  //         username: process.env.STRAPI_SUPER_USERNAME,
  //         password: process.env.STRAPI_SUPER_PASSWORD,
  //         email: process.env.STRAPI_SUPER_USER_EMAIL,
  //     },
  //     auto_start: true,
  //   },
  // },
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      serve: process.env.NODE_ENV === "development",
      develop: {
        open: process.env.OPEN_BROWSER !== "false",
      },
    },
  },
];

const modules = {
  // cacheService: {
  //   resolve: "@medusajs/cache-inmemory",
  //   options: {
  //     ttl: 300,
  //   },
  // },
  // eventBus: {
  //   resolve: "@medusajs/event-bus-local",
  // },
  eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL,
    },
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL,
      ttl: 300
    },
  },
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwt_secret: process.env.JWT_SECRET || "supersecret",
  cookie_secret: process.env.COOKIE_SECRET || "supersecret",
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  // Uncomment the following lines to enable REDIS
  redis_url: REDIS_URL,
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
};
