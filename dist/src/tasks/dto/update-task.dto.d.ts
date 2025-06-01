import { CreateTaskDto } from "./create-task.dto";
import { TaskStatus } from "../../common/enums/task-status.enum";
declare const UpdateTaskDto_base: import("@nestjs/common").Type<Partial<CreateTaskDto>>;
export declare class UpdateTaskDto extends UpdateTaskDto_base {
    status?: TaskStatus;
    actualHours?: number;
}
export {};
