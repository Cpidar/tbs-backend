import { 
    Column, 
    Entity, 
    JoinColumn, 
    ManyToOne, 
    PrimaryColumn,
  } from "typeorm"
import { Provinces } from "./provinces"
  
  @Entity()
  export class Cities {
    @PrimaryColumn('bigint')
    id: number

    @Column('bigint')
    province_id: number

    @Column()
    name: string

    @Column()
    slug: string

    @Column()
    lat: string

    @Column()
    long: string

    @ManyToOne(() => Provinces, (province) => province.cities)
    @JoinColumn({ name: 'province_id' })
    province: Provinces

  }