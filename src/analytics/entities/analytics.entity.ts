import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
// import { ObjectType, Field, ID, registerEnumType } from "@nestjs/graphql"
import { User } from "../../users/entities/user.entity"
import { Project } from "../../projects/entities/project.entity"

export enum AnalyticsEventType {
  USER_LOGIN = "user_login",
  USER_LOGOUT = "user_logout",
  TASK_CREATED = "task_created",
  TASK_UPDATED = "task_updated",
  TASK_COMPLETED = "task_completed",
  TASK_DELETED = "task_deleted",
  PROJECT_CREATED = "project_created",
  PROJECT_UPDATED = "project_updated",
  PROJECT_COMPLETED = "project_completed",
  TIME_LOGGED = "time_logged",
  COMMENT_ADDED = "comment_added",
  FILE_UPLOADED = "file_uploaded",
  NOTIFICATION_SENT = "notification_sent",
  SEARCH_PERFORMED = "search_performed",
}

// registerEnumType(AnalyticsEventType, {
//   name: "AnalyticsEventType",
// })

// @ObjectType()
@Entity("analytics")
export class Analytics {
  // @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string

  // @Field(() => AnalyticsEventType)
  @Column({
    type: "enum",
    enum: AnalyticsEventType,
  })
  eventType: AnalyticsEventType

  // @Field(() => String)
  @Column("jsonb")
  data: any

  // @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  user?: User

  // @Field(() => Project, { nullable: true })
  @ManyToOne(() => Project, { nullable: true, onDelete: "SET NULL" })
  project?: Project

  // @Field()
  @CreateDateColumn()
  createdAt: Date

  // @Field()
  @UpdateDateColumn()
  updatedAt: Date
}
