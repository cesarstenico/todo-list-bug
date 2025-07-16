import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) {}

    // Lists only tasks of the user
    async listTasks(userId: string) {
        return this.tasksRepository.find({
            where: {
                owner: { id: userId },
            },
        });
    }

    // Returns task and validates if it belongs to the user
    async getTaskIfOwnedByUser(id: string, userId: string) {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: ['owner'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.owner.id !== userId) {
            throw new ForbiddenException('You do not have access to this task');
        }

        return task;
    }

    // Edits a task, validating if the user is the owner
    async editTaskIfOwnedByUser(
        taskId: string,
        body: Partial<CreateTaskDto>,
        userId: string,
    ) {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId },
            relations: ['owner'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.owner.id !== userId) {
            throw new ForbiddenException('You cannot edit this task');
        }

        // Update task properties if they are provided in the body
        if (body.title !== undefined) task.title = body.title;
        if (body.description !== undefined) task.description = body.description;
        if (body.done !== undefined) task.done = body.done;
        if (body.dueDate !== undefined) task.dueDate = body.dueDate;

        const updatedTask = await this.tasksRepository.save(task);

        // Remove the 'pass' field from the owner before returning
        if (updatedTask.owner) {
            delete updatedTask.owner.pass;
        }

        return updatedTask;
    }
}
