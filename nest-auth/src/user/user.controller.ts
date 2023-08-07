import { BadRequestException, Body, Controller, Get, Post, Res, Req, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { TokenService } from './token.service';
import { MoreThanOrEqual } from 'typeorm';
import * as speakeasy from 'speakeasy';
import { OAuth2Client } from 'google-auth-library';

@Controller()
export class UserController {

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private tokenService: TokenService,
    ) { }

    @Post('register')
    async register(@Body() body: RegisterDto) {

        if (body.password !== body.password_confirm) {
            throw new BadRequestException('Passwords do not match!');
        }

        return this.userService.save({
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            password: await bcrypt.hash(body.password, 12)
        });
    }

    @Post('login')
    async login(
        @Body() body: LoginDto,
        @Res({ passthrough: true }) response: Response
    ) {
        const { email, password } = body;

        const user = await this.userService.findOne({ where: { email } })

        if (!user) {
            throw new BadRequestException('Invalid credentials!');
        }

        if (!await bcrypt.compare(password, user.password)) {
            throw new BadRequestException('Invalid credentials!');
        }

        response.status(200);

        if (user.tfa_secret) {
            return {
                id: user.id,
            }
        }

        const secret = speakeasy.generateSecret({
            name: 'My App'
        })

        return {
            id: user.id,
            secret: secret.ascii,
            otpauth_url: secret.otpauth_url
        }

    }

    @Post('two-factor')
    async twoFactor(
        @Res({ passthrough: true }) response: Response,
        @Body('id') id: number,
        @Body('code') code: string,
        @Body('secret') secret?: string,
    ) {
        const user = await this.userService.findOne({ where: { id } })

        if (!user) {
            throw new BadRequestException('Invalid credentials!');
        }

        if (!secret) {
            secret = user.tfa_secret
        }

        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'ascii',
            token: code
        })

        if (!verified) {
            console.log(secret)
            throw new BadRequestException('Invalid credentials!');
        }

        if (user.tfa_secret === '') {
            await this.userService.update(id, { tfa_secret: secret });
        }

        const accessToken = await this.jwtService.signAsync({ id: id }, { expiresIn: '30s' })

        const refreshToken = await this.jwtService.signAsync({ id: id })

        const expired_at = new Date();
        expired_at.setDate(expired_at.getDate() + 7);

        await this.tokenService.save({ user_id: id, token: refreshToken, expired_at })

        response.status(200);
        // response.cookie('access_token', accessToken, {
        //     httpOnly: true,
        //     maxAge: 30
        // })
        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
        })

        return {
            token: accessToken,
        };
    }

    @Get('user')
    async user(
        @Req() request: Request
    ) {
        try {
            // const accessToken = request.cookies['access_token']
            const accessToken = request.headers.authorization.replace('Bearer ', '');

            const { id } = await this.jwtService.verifyAsync(accessToken);

            const { password, ...data } = await this.userService.findOne({ where: { id } });

            return data;

        } catch (error) {
            throw new UnauthorizedException();
        }
    }

    @Post('refresh')
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        try {
            const refreshToken = request.cookies['refresh_token']

            const { id } = await this.jwtService.verifyAsync(refreshToken);

            const tokenEntity = await this.tokenService.findOne({
                where: {
                    user_id: id,
                    expired_at: MoreThanOrEqual(new Date())
                }
            })

            if (!tokenEntity) {
                throw new UnauthorizedException();
            }

            const accessToken = await this.jwtService.signAsync({
                id: id
            }, { expiresIn: '30s' })

            response.status(200);
            return { token: accessToken };

        } catch (error) {
            throw new UnauthorizedException();
        }
    }

    @Post('logout')
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = request.cookies['refresh_token']
        await this.tokenService.delete({ token: refreshToken });
        response.clearCookie('refresh_token');
        return {
            message: 'success'
        };
    }

    @Post('google-auth')
    async googleAuth(
        @Body('token') token: string,
        @Res({ passthrough: true }) response: Response
    ) {
        const clientId = '517727868599-6nv5dg4rrm7k0cskfv49eu7hfo8gh5o0.apps.googleusercontent.com';

        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId
        })

        const googleUser = ticket.getPayload();
        if (!googleUser) {
            throw new UnauthorizedException();
        }

        let user = await this.userService.findOne({ where: { email: googleUser.email } })

        if (!user) {
            user = await this.userService.save({
                first_name: googleUser.given_name,
                last_name: googleUser.family_name,
                email: googleUser.email,
                password: await bcrypt.hash(token, 12)
            })
        }

        const accessToken = await this.jwtService.signAsync({ id: user.id }, { expiresIn: '30s' })

        const refreshToken = await this.jwtService.signAsync({ id: user.id })

        const expired_at = new Date();
        expired_at.setDate(expired_at.getDate() + 7);

        await this.tokenService.save({ user_id: user.id, token: refreshToken, expired_at })

        response.status(200);

        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
        })

        return {
            token: accessToken,
        };
    }
}
