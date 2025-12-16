import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'), // 👈 acá va el secret
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService],
  controllers:[AuthController],
  exports: [AuthService],
})
export class AuthModule { }


// @Module({
//   imports: [
//     UsersModule,
//     ConfigModule.forRoot(),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (config: ConfigService) => ({
//         secret: config.get<string>('JWT_SECRET'), // 👈 acá va el secret
//         signOptions: { expiresIn: '1h' },
//       }),
//     }),
//   ],
//   providers: [AuthService],
//   exports: [AuthService],
// })
// export class AuthModule {}



//  imports: [UsersModule,JwtModule],
//   controllers: [AuthController],
//   providers: [AuthService,UsersService],