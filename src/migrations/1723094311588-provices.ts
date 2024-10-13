import { MigrationInterface, QueryRunner } from "typeorm";

export class Provices1723094311588 implements MigrationInterface {
    name = 'Provices1723094311588'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cities" ("id" bigint NOT NULL, "province_id" bigint NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "lat" character varying NOT NULL, "long" character varying NOT NULL, CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "provinces" ("id" bigint NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, CONSTRAINT "PK_2e4260eedbcad036ec53222e0c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_52af18d505515614479e5c9f5e9" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_52af18d505515614479e5c9f5e9"`);
        await queryRunner.query(`DROP TABLE "provinces"`);
        await queryRunner.query(`DROP TABLE "cities"`);
    }

}
