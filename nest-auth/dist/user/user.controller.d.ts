import { RegisterDto } from './dtos/register.dto';
import { UserService } from './user.service';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { TokenService } from './token.service';
export declare class UserController {
    private userService;
    private jwtService;
    private tokenService;
    constructor(userService: UserService, jwtService: JwtService, tokenService: TokenService);
    register(body: RegisterDto): Promise<any>;
    login(body: LoginDto, response: Response): Promise<{
        id: number;
        secret?: undefined;
        otpauth_url?: undefined;
    } | {
        id: number;
        secret: any;
        otpauth_url: any;
    }>;
    twoFactor(response: Response, id: number, code: string, secret?: string): Promise<{
        token: string;
    }>;
    user(request: Request): Promise<{
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        tfa_secret: string;
    }>;
    refresh(request: Request, response: Response): Promise<{
        token: string;
    }>;
    logout(request: Request, response: Response): Promise<{
        message: string;
    }>;
    googleAuth(token: string, response: Response): Promise<{
        token: string;
    }>;
}
