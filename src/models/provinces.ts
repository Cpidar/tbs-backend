import { 
    Column, 
    Entity, 
    OneToMany, 
    PrimaryColumn,
  } from "typeorm"
import { Cities } from "./cities"
  
  @Entity()
  export class Provinces {
    @PrimaryColumn('bigint')
    id: number

    @Column()
    name: string

    @Column()
    slug: string

    @OneToMany(() => Cities, (cities) => cities.province)
    cities: Cities[]
  
  }