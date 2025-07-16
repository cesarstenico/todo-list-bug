import {
    UseGuards,
    Req,
    Body,
    Controller,
    Get,
    Param,
    Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Get()
    listTasks(@Req() req) {
        return this.tasksService.listTasks(req.user.id);
    }

    @Get('/:id')
    getTask(@Param('id') id: string, @Req() req) {
        return this.tasksService.getTaskIfOwnedByUser(id, req.user.id);
    }

    @Put('/:id')
    editTask(@Param('id') id: string, @Body() body: CreateTaskDto, @Req() req) {
        return this.tasksService.editTaskIfOwnedByUser(
            id,
            { ...body },
            req.user.id,
        );
    }
}
