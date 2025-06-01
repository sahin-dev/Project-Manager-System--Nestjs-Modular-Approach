import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm"
import { ObjectType, Field, ID } from "@nestjs/graphql"
import { User } from "../../users/entities/user.entity"
import { Task } from "../../tasks/entities/task.entity"

@ObjectType()
@Entity("projects")
export class Project {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Field()
  @Column()
  name: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  startDate?: Date

  @Field({ nullable: true })
  @Column({ nullable: true })
  endDate?: Date

  @Field()
  @Column({ default: true })
  isActive: boolean

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
    (user) => user.ownedProjects,
  )
  owner: User

  @Field(() => [User])
  @ManyToMany(
    () => User,
    (user) => user.projects,
  )
  @JoinTable({
    name: "project_members",
    joinColumn: { name: "project_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "user_id", referencedColumnName: "id" },
  })
  members: User[]

  @Field(() => [Task], { nullable: true })
  @OneToMany(
    () => Task,
    (task) => task.project,
  )
  tasks?: Task[]
}
