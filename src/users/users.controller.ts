import {
    Body,
    Controller,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('/create')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() body: CreateUserDto) {
        const user = await this.usersService.create(body);
        return user;
    }
}
