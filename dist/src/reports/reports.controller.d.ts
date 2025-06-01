import type { Response } from "express";
import type { ReportsService } from "./reports.service";
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generateProjectReport(id: string, format: "pdf" | "csv", res: Response): Promise<void>;
    generateUserReport(id: string, format: "pdf" | "csv", res: Response): Promise<void>;
    generateSystemReport(format: "pdf" | "csv", res: Response): Promise<void>;
}
