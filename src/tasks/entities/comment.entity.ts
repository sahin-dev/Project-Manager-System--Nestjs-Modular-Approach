import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm"
import { ObjectType, Field, ID } from "@nestjs/graphql"
import { User } from "../../users/entities/user.entity"
import { Task } from "./task.entity"

@ObjectType()
@Entity("comments")
export class Comment {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Field()
  @Column()
  content: string

  @Field()
  @CreateDateColumn()
  createdAt: Date

  @Field()
  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @Field(() => User)
  @ManyToOne(
    () => User,
    (user) => user.comments,
  )
  author: User

  @Field(() => Task)
  @ManyToOne(
    () => Task,
    (task) => task.comments,
  )
  task: Task
}
