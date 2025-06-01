import { Injectable, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Task } from "../entities/task.entity"

@Injectable()
export class DependencyResolverService {
  constructor(private taskRepository: Repository<Task>) {}

  /**
   * Topological sort to resolve task dependencies and detect circular dependencies
   */
  async validateAndResolveDependencies(taskId: string, dependencyIds: string[]): Promise<boolean> {
    // Check for circular dependencies
    const hasCircularDependency = await this.detectCircularDependency(taskId, dependencyIds)

    if (hasCircularDependency) {
      throw new BadRequestException("Circular dependency detected")
    }

    return true
  }

  /**
   * Detect circular dependencies using DFS
   */
  private async detectCircularDependency(taskId: string, newDependencyIds: string[]): Promise<boolean> {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    // Build adjacency list including new dependencies
    const adjacencyList = await this.buildAdjacencyList()

    // Add new dependencies to the adjacency list
    if (!adjacencyList.has(taskId)) {
      adjacencyList.set(taskId, [])
    }
    adjacencyList.get(taskId)!.push(...newDependencyIds)

    // Check for cycles starting from each new dependency
    for (const depId of newDependencyIds) {
      if (await this.hasCycleDFS(depId, taskId, adjacencyList, visited, recursionStack)) {
        return true
      }
    }

    return false
  }

  private async hasCycleDFS(
    currentNode: string,
    targetNode: string,
    adjacencyList: Map<string, string[]>,
    visited: Set<string>,
    stack: Set<string>,
  ): Promise<boolean> {
    if (stack.has(currentNode)) {
      return true // Cycle detected
    }

    if (visited.has(currentNode)) {
      return false // Already processed
    }

    visited.add(currentNode)
    stack.add(currentNode)

    const dependencies = adjacencyList.get(currentNode) || []

    for (const dep of dependencies) {
      if (dep === targetNode) {
        return true // Direct cycle to target
      }

      if (await this.hasCycleDFS(dep, targetNode, adjacencyList, visited, stack)) {
        return true
      }
    }

    stack.delete(currentNode)
    return false
  }

  /**
   * Build adjacency list from existing task dependencies
   */
  private async buildAdjacencyList(): Promise<Map<string, string[]>> {
    const tasks = await this.taskRepository.find({
      relations: ["dependencies"],
    })

    const adjacencyList = new Map<string, string[]>()

    for (const task of tasks) {
      const dependencyIds = task.dependencies?.map((dep) => dep.id) || []
      adjacencyList.set(task.id, dependencyIds)
    }

    return adjacencyList
  }

  /**
   * Get tasks in topological order (dependencies first)
   */
  async getTasksInExecutionOrder(projectId: string): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: { project: { id: projectId } },
      relations: ["dependencies", "project"],
    })

    const adjacencyList = new Map<string, string[]>()
    const inDegree = new Map<string, number>()
    const taskMap = new Map<string, Task>()

    // Initialize
    for (const task of tasks) {
      taskMap.set(task.id, task)
      adjacencyList.set(task.id, [])
      inDegree.set(task.id, 0)
    }

    // Build adjacency list and calculate in-degrees
    for (const task of tasks) {
      for (const dependency of task.dependencies || []) {
        adjacencyList.get(dependency.id)!.push(task.id)
        inDegree.set(task.id, inDegree.get(task.id)! + 1)
      }
    }

    // Topological sort using Kahn's algorithm
    const queue: string[] = []
    const result: Task[] = []

    // Add all tasks with no dependencies to queue
    for (const [taskId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(taskId)
      }
    }

    while (queue.length > 0) {
      const currentTaskId = queue.shift()!
      const currentTask = taskMap.get(currentTaskId)!
      result.push(currentTask)

      // Process all dependent tasks
      for (const dependentTaskId of adjacencyList.get(currentTaskId)!) {
        inDegree.set(dependentTaskId, inDegree.get(dependentTaskId)! - 1)

        if (inDegree.get(dependentTaskId) === 0) {
          queue.push(dependentTaskId)
        }
      }
    }

    // Check if all tasks were processed (no cycles)
    if (result.length !== tasks.length) {
      throw new BadRequestException("Circular dependency detected in project tasks")
    }

    return result
  }
}
