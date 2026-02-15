import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from './roles/role.entity';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { SitesModule } from './sites/sites.module';
import { PhasesModule } from './phases/phases.module';
import { PilesModule } from './piles/piles.module';
import { PileReportModule } from './pile-report/pile-report.module';
import * as bcrypt from 'bcrypt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false,
        },
        synchronize: false,
      }),
    }),

    RolesModule,

    UsersModule,

    AuthModule,

    SitesModule,

    PhasesModule,

    PilesModule,

    PileReportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    const roleRepo = this.dataSource.getRepository(Role);
    const userRepo = this.dataSource.getRepository(User);

    // Create Roles
    const roles = ['SUPER_ADMIN', 'ADMIN', 'ENGINEER'];

    for (const roleName of roles) {
      const exists = await roleRepo.findOne({ where: { name: roleName } });
      if (!exists) {
        await roleRepo.save(roleRepo.create({ name: roleName }));
      }
    }

    // Create Super Admin
    const superAdminRole = await roleRepo.findOne({
      where: { name: 'SUPER_ADMIN' },
    });

    const existingUser = await userRepo.findOne({
      where: { email: 'superadmin@site.com' },
    });

    if (!existingUser && superAdminRole) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await userRepo.save(
        userRepo.create({
          fullName: 'Super Admin',
          email: 'superadmin@site.com',
          password: hashedPassword,
          role: superAdminRole,
        }),
      );
    }

    // Create Test Engineer
    const engineerRole = await roleRepo.findOne({
      where: { name: 'ENGINEER' },
    });

    const existingEngineer = await userRepo.findOne({
      where: { email: 'engineer@site.com' },
    });

    if (!existingEngineer && engineerRole) {
      const hashedPassword = await bcrypt.hash('engineer123', 10);

      await userRepo.save(
        userRepo.create({
          fullName: 'Test Engineer',
          email: 'engineer@site.com',
          password: hashedPassword,
          role: engineerRole,
        }),
      );
    }
  }
}
