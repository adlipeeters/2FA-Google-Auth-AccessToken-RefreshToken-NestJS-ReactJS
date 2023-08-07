import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { TokenService } from './user/token.service';
import { ResetModule } from './reset/reset.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'nest_auth',
    // entities: [],
    autoLoadEntities: true,
    synchronize: true,
  }), UserModule, ResetModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
