const { DataSource } = require("typeorm")

const AppDataSource = new DataSource({
  type: "postgres",
  url: "postgresql://root:5yUKmCMfgOTtDuGhuGB8qhQ1@tirich-mir.liara.cloud:31213/postgres",
  entities: [
    "dist/models/*.js",
  ],
  migrations: [
    "dist/migrations/*.js",
  ],
})

module.exports = {
  datasource: AppDataSource,
}