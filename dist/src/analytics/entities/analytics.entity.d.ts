import { User } from "../../users/entities/user.entity";
import { Project } from "../../projects/entities/project.entity";
export declare enum AnalyticsEventType {
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
    SEARCH_PERFORMED = "search_performed"
}
export declare class Analytics {
    id: string;
    eventType: AnalyticsEventType;
    data: any;
    user?: User;
    project?: Project;
    createdAt: Date;
    updatedAt: Date;
}
