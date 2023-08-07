"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const bcrypt = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
const token_service_1 = require("./token.service");
const typeorm_1 = require("typeorm");
const speakeasy = require("speakeasy");
const google_auth_library_1 = require("google-auth-library");
let UserController = exports.UserController = class UserController {
    constructor(userService, jwtService, tokenService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.tokenService = tokenService;
    }
    async register(body) {
        if (body.password !== body.password_confirm) {
            throw new common_1.BadRequestException('Passwords do not match!');
        }
        return this.userService.save({
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            password: await bcrypt.hash(body.password, 12)
        });
    }
    async login(body, response) {
        const { email, password } = body;
        const user = await this.userService.findOne({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException('Invalid credentials!');
        }
        if (!await bcrypt.compare(password, user.password)) {
            throw new common_1.BadRequestException('Invalid credentials!');
        }
        response.status(200);
        if (user.tfa_secret) {
            return {
                id: user.id,
            };
        }
        const secret = speakeasy.generateSecret({
            name: 'My App'
        });
        return {
            id: user.id,
            secret: secret.ascii,
            otpauth_url: secret.otpauth_url
        };
    }
    async twoFactor(response, id, code, secret) {
        const user = await this.userService.findOne({ where: { id } });
        if (!user) {
            throw new common_1.BadRequestException('Invalid credentials!');
        }
        if (!secret) {
            secret = user.tfa_secret;
        }
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'ascii',
            token: code
        });
        if (!verified) {
            console.log(secret);
            throw new common_1.BadRequestException('Invalid credentials!');
        }
        if (user.tfa_secret === '') {
            await this.userService.update(id, { tfa_secret: secret });
        }
        const accessToken = await this.jwtService.signAsync({ id: id }, { expiresIn: '30s' });
        const refreshToken = await this.jwtService.signAsync({ id: id });
        const expired_at = new Date();
        expired_at.setDate(expired_at.getDate() + 7);
        await this.tokenService.save({ user_id: id, token: refreshToken, expired_at });
        response.status(200);
        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return {
            token: accessToken,
        };
    }
    async user(request) {
        try {
            const accessToken = request.headers.authorization.replace('Bearer ', '');
            const { id } = await this.jwtService.verifyAsync(accessToken);
            const { password, ...data } = await this.userService.findOne({ where: { id } });
            return data;
        }
        catch (error) {
            throw new common_1.UnauthorizedException();
        }
    }
    async refresh(request, response) {
        try {
            const refreshToken = request.cookies['refresh_token'];
            const { id } = await this.jwtService.verifyAsync(refreshToken);
            const tokenEntity = await this.tokenService.findOne({
                where: {
                    user_id: id,
                    expired_at: (0, typeorm_1.MoreThanOrEqual)(new Date())
                }
            });
            if (!tokenEntity) {
                throw new common_1.UnauthorizedException();
            }
            const accessToken = await this.jwtService.signAsync({
                id: id
            }, { expiresIn: '30s' });
            response.status(200);
            return { token: accessToken };
        }
        catch (error) {
            throw new common_1.UnauthorizedException();
        }
    }
    async logout(request, response) {
        const refreshToken = request.cookies['refresh_token'];
        await this.tokenService.delete({ token: refreshToken });
        response.clearCookie('refresh_token');
        return {
            message: 'success'
        };
    }
    async googleAuth(token, response) {
        const clientId = '517727868599-6nv5dg4rrm7k0cskfv49eu7hfo8gh5o0.apps.googleusercontent.com';
        const client = new google_auth_library_1.OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId
        });
        const googleUser = ticket.getPayload();
        if (!googleUser) {
            throw new common_1.UnauthorizedException();
        }
        let user = await this.userService.findOne({ where: { email: googleUser.email } });
        if (!user) {
            user = await this.userService.save({
                first_name: googleUser.given_name,
                last_name: googleUser.family_name,
                email: googleUser.email,
                password: await bcrypt.hash(token, 12)
            });
        }
        const accessToken = await this.jwtService.signAsync({ id: user.id }, { expiresIn: '30s' });
        const refreshToken = await this.jwtService.signAsync({ id: user.id });
        const expired_at = new Date();
        expired_at.setDate(expired_at.getDate() + 7);
        await this.tokenService.save({ user_id: user.id, token: refreshToken, expired_at });
        response.status(200);
        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return {
            token: accessToken,
        };
    }
};
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('two-factor'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Body)('id')),
    __param(2, (0, common_1.Body)('code')),
    __param(3, (0, common_1.Body)('secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "twoFactor", null);
__decorate([
    (0, common_1.Get)('user'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "user", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('google-auth'),
    __param(0, (0, common_1.Body)('token')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "googleAuth", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        token_service_1.TokenService])
], UserController);
//# sourceMappingURL=user.controller.js.map