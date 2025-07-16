import { IsBoolean, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    description: string;

    @IsBoolean()
    done: boolean;

    @IsDateString()
    dueDate: string;
}
