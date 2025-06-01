import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm"
// import { ObjectType, Field, ID, Int } from "@nestjs/graphql"
import { TaskStatus } from "../../common/enums/task-status.enum"
import { TaskPriority } from "../../common/enums/task-priority.enum"
import { User } from "../../users/entities/user.entity"
import { Project } from "../../projects/entities/project.entity"
import { Comment } from "./comment.entity"


@Entity("tasks")
export class Task {
  
  @PrimaryGeneratedColumn("uuid")
  id: string


  @Column()
  title: string


  @Column({ nullable: true })
  description?: string


  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus


  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority


  @Column({ default: 0 })
  estimatedHours: number


  @Column({ default: 0 })
  actualHours: number


  @Column({ nullable: true })
  dueDate?: Date


  @Column("text", { array: true, nullable: true })
  tags?: string[]


  @CreateDateColumn()
  createdAt: Date


  @UpdateDateColumn()
  updatedAt: Date


  @ManyToOne(
    () => Project,
    (project) => project.tasks,
  )
  project: Project

 
  @ManyToOne(
    () => User,
    (user) => user.createdTasks,
  )
  creator: User


  @ManyToOne(
    () => User,
    (user) => user.assignedTasks,
    { nullable: true },
  )
  assignee?: User


  @ManyToMany(
    () => Task,
    (task) => task.blockedBy,
  )
  @JoinTable({
    name: "task_dependencies",
    joinColumn: { name: "task_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "dependency_id", referencedColumnName: "id" },
  })
  dependencies?: Task[]


  @ManyToMany(
    () => Task,
    (task) => task.dependencies,
  )
  blockedBy?: Task[]

  @OneToMany(
    () => Comment,
    (comment) => comment.task,
  )
  comments?: Comment[]
}
