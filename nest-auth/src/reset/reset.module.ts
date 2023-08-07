import { Module } from '@nestjs/common';
import { ResetController } from './reset.controller';
import { ResetService } from './reset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reset } from './reset.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reset]),
    MailerModule.forRoot({
      transport: {
        //for docker
        // host: 'docker.for.mac.localhost',
        host: 'localhost',
        port: 1025,
      },
      defaults: {
        from: 'no-reply@example.com',
      },
    }),
    UserModule
  ],
  controllers: [ResetController],
  providers: [ResetService]
})
export class ResetModule { }
