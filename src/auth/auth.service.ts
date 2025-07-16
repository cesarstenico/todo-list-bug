import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
    id: string;
    email: string;
}

export interface LoginResponse {
    access_token: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async signIn(email: string, pass: string): Promise<LoginResponse> {
        const user = await this.usersService.findOne(email);

        if (!user) {
            this.logger.warn(`Login attempt failed: user ${email} not found`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordValid = await bcrypt.compare(pass, user.pass);
        if (!passwordValid) {
            this.logger.warn(
                `Login attempt failed: invalid password for user ${email}`,
            );
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = { id: user.id, email: user.email };

        const access_token = await this.jwtService.signAsync(payload, {
            expiresIn: '1h',
        });

        return { access_token };
    }
}
