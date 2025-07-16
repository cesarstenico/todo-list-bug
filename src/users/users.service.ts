import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(body: CreateUserDto): Promise<Omit<User, 'pass'>> {
        const existingUser = await this.usersRepository.findOneBy({
            email: body.email,
        });
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const user = this.usersRepository.create({
            email: body.email,
            fullname: body.fullname,
            pass: await this.hashPassword(body.password),
        });

        await this.usersRepository.save(user);

        this.logger.log(`User created: ${user.email}`);

        // Remove a senha do objeto antes de retornar
        const { pass, ...result } = user;
        return result;
    }

    async findOne(email: string): Promise<User | null> {
        const user = await this.usersRepository.findOneBy({ email });
        return user ?? null;
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
}
