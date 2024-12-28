import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user';

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column({ default: 'pending' })
    status!: string;

    @ManyToOne(() => User, (user) => user.tasks)
    user!: User;
}
