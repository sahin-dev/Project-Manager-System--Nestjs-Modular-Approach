import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
// import { ObjectType, Field, ID } from "@nestjs/graphql"
import { User } from "../../users/entities/user.entity"

export type NotificationType = "TASK_ASSIGNED" | "COMMENT_ADDED" | "DEADLINE_APPROACHING" | "SYSTEM" | "PROJECT_UPDATE"

// @ObjectType()
@Entity("notifications")
export class Notification {
  // @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string

  // @Field(() => User)
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User

  // @Field()
  @Column({
    type: "enum",
    enum: ["TASK_ASSIGNED", "COMMENT_ADDED", "DEADLINE_APPROACHING", "SYSTEM", "PROJECT_UPDATE"],
    default: "SYSTEM",
  })
  type: NotificationType

  // @Field()
  @Column()
  title: string

  // @Field()
  @Column("text")
  message: string

  // @Field()
  @Column({ default: false })
  isRead: boolean

  // @Field({ nullable: true })
  @Column({ nullable: true })
  entityId: string

  // @Field({ nullable: true })
  @Column({ nullable: true })
  entityType: string

  // @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date

  // @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date
}
