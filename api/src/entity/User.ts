import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text", default: "user" })
    role: string;

    @Column({ type: "text", default: "" })
    address: string;

    @Column({ type: "text", nullable: true, unique: true })
    email: string;

    @Column({ unique: true, type: "varchar", length: "130" })
    username: string;

    // this field will be still requested in hashed form meaning we can use plain as default
    @Column({ type: "text", default: "temp" })
    hsPassword: string;

    @Column({ type: "int", default: 0 })
    tokenVersion: number;

    @CreateDateColumn({ type: "date" })
    createdAt: Date;

}
