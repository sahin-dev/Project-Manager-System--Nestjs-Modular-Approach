import type { Repository } from "typeorm";
import type { Response } from "express";
import type { Task } from "../tasks/entities/task.entity";
import type { Project } from "../projects/entities/project.entity";
import type { User } from "../users/entities/user.entity";
import type { AnalyticsService } from "../analytics/analytics.service";
export declare class ReportsService {
    private taskRepository;
    private projectRepository;
    private userRepository;
    private analyticsService;
    constructor(taskRepository: Repository<Task>, projectRepository: Repository<Project>, userRepository: Repository<User>, analyticsService: AnalyticsService);
    generateProjectReport(projectId: string, format?: "pdf" | "csv"): Promise<Buffer | string>;
    generateUserReport(userId: string, format?: "pdf" | "csv"): Promise<Buffer | string>;
    generateSystemReport(format?: "pdf" | "csv"): Promise<Buffer | string>;
    private generateProjectCSV;
    private generateUserCSV;
    private generateSystemCSV;
    private generateProjectPDF;
    private generateUserPDF;
    private generateSystemPDF;
    streamReport(res: Response, data: Buffer | string, filename: string, format: "pdf" | "csv"): Promise<void>;
}
