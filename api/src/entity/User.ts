import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn({ type: "int" })
    id: number;

    @Column({ type: "text" })
    role: string;

    @Column({ type: "text", unique: true })
    email: string;

    @Column({ unique: true, type: "varchar", length: "130" })
    userName: string;

    @Column({ type: "text" })
    hsPassword: string;

    @Column({ type: "int", default: 0 })
    tokenVersion: number;

    @CreateDateColumn({ type: "date" })
    createdAt: Date;

}
