import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from "typeorm"
// import { ObjectType, Field, ID } from "@nestjs/graphql"
import { Role } from "../../common/enums/role.enum"
import { Project } from "../../projects/entities/project.entity"
import { Task } from "../../tasks/entities/task.entity"
import { Comment } from "../../tasks/entities/comment.entity"


@Entity("users")
export class User {

  @PrimaryGeneratedColumn("uuid")
  id: string


  @Column({ unique: true })
  email: string


  @Column()
  firstName: string


  @Column()
  lastName: string

  @Column()
  password: string


  @Column({
    type: "enum",
    enum: Role,
    default: Role.DEVELOPER,
  })
  role: Role

  
  @Column({ nullable: true })
  avatar?: string


  @Column({ nullable: true })
  bio?: string


  @Column("text", { array: true, nullable: true })
  skills?: string[]


  @Column({ default: true })
  isActive: boolean


  @CreateDateColumn()
  createdAt: Date


  @UpdateDateColumn()
  updatedAt: Date

  // Relations

  @OneToMany(
    () => Project,
    (project) => project.owner,
  )
  ownedProjects?: Project[]

  
  @ManyToMany(
    () => Project,
    (project) => project.members,
  )
  projects?: Project[]


  @OneToMany(
    () => Task,
    (task) => task.assignee,
  )
  assignedTasks?: Task[]


  @OneToMany(
    () => Task,
    (task) => task.creator,
  )
  createdTasks?: Task[]


  @OneToMany(
    () => Comment,
    (comment) => comment.author,
  )
  comments?: Comment[]
}
