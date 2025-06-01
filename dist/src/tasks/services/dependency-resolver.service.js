"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyResolverService = void 0;
const common_1 = require("@nestjs/common");
let DependencyResolverService = class DependencyResolverService {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    async validateAndResolveDependencies(taskId, dependencyIds) {
        const hasCircularDependency = await this.detectCircularDependency(taskId, dependencyIds);
        if (hasCircularDependency) {
            throw new common_1.BadRequestException("Circular dependency detected");
        }
        return true;
    }
    async detectCircularDependency(taskId, newDependencyIds) {
        const visited = new Set();
        const recursionStack = new Set();
        const adjacencyList = await this.buildAdjacencyList();
        if (!adjacencyList.has(taskId)) {
            adjacencyList.set(taskId, []);
        }
        adjacencyList.get(taskId).push(...newDependencyIds);
        for (const depId of newDependencyIds) {
            if (await this.hasCycleDFS(depId, taskId, adjacencyList, visited, recursionStack)) {
                return true;
            }
        }
        return false;
    }
    async hasCycleDFS(currentNode, targetNode, adjacencyList, visited, recursionStack) {
        if (recursionStack.has(currentNode)) {
            return true;
        }
        if (visited.has(currentNode)) {
            return false;
        }
        visited.add(currentNode);
        recursionStack.add(currentNode);
        const dependencies = adjacencyList.get(currentNode) || [];
        for (const dep of dependencies) {
            if (dep === targetNode) {
                return true;
            }
            if (await this.hasCycleDFS(dep, targetNode, adjacencyList, visited, recursionStack)) {
                return true;
            }
        }
        recursionStack.delete(currentNode);
        return false;
    }
    async buildAdjacencyList() {
        const tasks = await this.taskRepository.find({
            relations: ["dependencies"],
        });
        const adjacencyList = new Map();
        for (const task of tasks) {
            const dependencyIds = task.dependencies?.map((dep) => dep.id) || [];
            adjacencyList.set(task.id, dependencyIds);
        }
        return adjacencyList;
    }
    async getTasksInExecutionOrder(projectId) {
        const tasks = await this.taskRepository.find({
            where: { project: { id: projectId } },
            relations: ["dependencies", "project"],
        });
        const adjacencyList = new Map();
        const inDegree = new Map();
        const taskMap = new Map();
        for (const task of tasks) {
            taskMap.set(task.id, task);
            adjacencyList.set(task.id, []);
            inDegree.set(task.id, 0);
        }
        for (const task of tasks) {
            for (const dependency of task.dependencies || []) {
                adjacencyList.get(dependency.id).push(task.id);
                inDegree.set(task.id, inDegree.get(task.id) + 1);
            }
        }
        const queue = [];
        const result = [];
        for (const [taskId, degree] of inDegree) {
            if (degree === 0) {
                queue.push(taskId);
            }
        }
        while (queue.length > 0) {
            const currentTaskId = queue.shift();
            const currentTask = taskMap.get(currentTaskId);
            result.push(currentTask);
            for (const dependentTaskId of adjacencyList.get(currentTaskId)) {
                inDegree.set(dependentTaskId, inDegree.get(dependentTaskId) - 1);
                if (inDegree.get(dependentTaskId) === 0) {
                    queue.push(dependentTaskId);
                }
            }
        }
        if (result.length !== tasks.length) {
            throw new common_1.BadRequestException("Circular dependency detected in project tasks");
        }
        return result;
    }
};
exports.DependencyResolverService = DependencyResolverService;
exports.DependencyResolverService = DependencyResolverService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function])
], DependencyResolverService);
//# sourceMappingURL=dependency-resolver.service.js.map