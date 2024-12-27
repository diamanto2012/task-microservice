import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number; // Используем "!" для указания на инициализацию позже

    @Column()
    username!: string;

    @Column()
    email!: string;

    @OneToMany(() => Task, (task) => task.user)
    tasks!: Task[]; // Используем "!" для указания на инициализацию позже
}