import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user';

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id!: number; // Используйте "!" для указания на инициализацию позже

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column({ default: 'pending' }) // Устанавливаем статус по умолчанию
    status!: string;

    @ManyToOne(() => User, (user) => user.tasks)
    user!: User; // Используйте "!" для указания на инициализацию позже
}