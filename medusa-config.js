const dotenv = require("dotenv");

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
      upload_dir: 'uploads', // optional
      backend_url: 'https://tabeshelecshop-api.liara.run' // optional
    }
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
            searchableAttributes: [
              "title", 
              "description",
              "variant_sku",
            ],
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
        },
      },
    },
  },
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
      redisUrl: REDIS_URL
    }
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL
    }
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
  redis_url: REDIS_URL
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
};
