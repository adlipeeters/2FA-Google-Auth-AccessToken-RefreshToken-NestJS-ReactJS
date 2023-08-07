import { ResetService } from './reset.service';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/user/user.service';
export declare class ResetController {
    private resetService;
    private mailerService;
    private userService;
    constructor(resetService: ResetService, mailerService: MailerService, userService: UserService);
    forgot(email: string): Promise<{
        message: string;
    }>;
    reset(token: string, password: string, password_confirm: string): Promise<{
        message: string;
    }>;
}
