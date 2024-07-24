import { MigrationInterface, QueryRunner } from "typeorm";

export class Provinces1721390639320 implements MigrationInterface {
    name = 'Provinces1721390639320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_4762ffb6e5d198cfec5606bc11e"`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_52af18d505515614479e5c9f5e9" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_52af18d505515614479e5c9f5e9"`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_4762ffb6e5d198cfec5606bc11e" FOREIGN KEY ("id") REFERENCES "provinces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
