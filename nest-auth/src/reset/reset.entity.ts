import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Reset {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column({
        unique: true
    })
    token: string;
}