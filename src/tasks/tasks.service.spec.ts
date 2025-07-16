import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
    let service: TasksService;
    let tasksRepository: jest.Mocked<Partial<Repository<Task>>>;

    beforeEach(async () => {
        const mockRepo = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: getRepositoryToken(Task),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        tasksRepository = module.get(getRepositoryToken(Task));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('listTasks', () => {
        it('should return an array of tasks for the given user', async () => {
            const userId = 'user-1';
            const tasks = [
                { id: '1', title: 'Task 1', owner: { id: userId } },
                { id: '2', title: 'Task 2', owner: { id: userId } },
            ];

            tasksRepository.find!.mockResolvedValue(tasks as Task[]);

            const result = await service.listTasks(userId);
            expect(result).toEqual(tasks);
            expect(tasksRepository.find).toHaveBeenCalledWith({
                where: { owner: { id: userId } },
            });
        });

        it('should return an empty array if no tasks are found', async () => {
            const userId = 'user-1';
            tasksRepository.find!.mockResolvedValue([]);

            const result = await service.listTasks(userId);
            expect(result).toEqual([]);
        });
    });

    describe('getTaskIfOwnedByUser', () => {
        const taskId = 'task-123';
        const userId = 'user-1';

        it('should return the task if owned by user', async () => {
            const task = { id: taskId, title: 'Test', owner: { id: userId } };
            tasksRepository.findOne!.mockResolvedValue(task as Task);

            const result = await service.getTaskIfOwnedByUser(taskId, userId);
            expect(result).toEqual(task);
        });

        it('should throw NotFoundException if task does not exist', async () => {
            tasksRepository.findOne!.mockResolvedValue(null);

            await expect(
                service.getTaskIfOwnedByUser(taskId, userId),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if task is not owned by user', async () => {
            const task = {
                id: taskId,
                title: 'Test',
                owner: { id: 'another-user' },
            };
            tasksRepository.findOne!.mockResolvedValue(task as Task);

            await expect(
                service.getTaskIfOwnedByUser(taskId, userId),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('editTaskIfOwnedByUser', () => {
        const userId = 'user-1';
        const taskData = { id: 'task-1', title: 'Updated title' };

        it('should update and return task if user is owner', async () => {
            const existingTask = {
                id: 'task-1',
                title: 'Old title',
                owner: { id: userId },
            };

            const updatedTask = {
                ...existingTask,
                ...taskData,
            };

            tasksRepository.findOne!.mockResolvedValue(existingTask as Task);
            tasksRepository.save!.mockResolvedValue(updatedTask as Task);

            const result = await service.editTaskIfOwnedByUser(
                existingTask.id,
                taskData,
                userId,
            );
            expect(result).toEqual(updatedTask);
        });

        it('should throw NotFoundException if task not found', async () => {
            tasksRepository.findOne!.mockResolvedValue(null);

            await expect(
                service.editTaskIfOwnedByUser(taskData.id, taskData, userId),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if user does not own task', async () => {
            const existingTask = {
                id: 'task-1',
                title: 'Old title',
                owner: { id: 'other-user' },
            };

            tasksRepository.findOne!.mockResolvedValue(existingTask as Task);

            await expect(
                service.editTaskIfOwnedByUser(taskData.id, taskData, userId),
            ).rejects.toThrow(ForbiddenException);
        });
    });
});
