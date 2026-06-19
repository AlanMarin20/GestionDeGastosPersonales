import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { IncomesModule } from './incomes/incomes.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AuthModule } from './auth/auth.module';
import { BudgetsModule } from './budgets/budgets.module';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module';
import { SavingsMovementsModule } from './savings-movements/savings-movements.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { RolesModule } from './roles/roles.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { BalancesModule } from './balances/balances.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { AsesorModule } from './asesor/asesor.module';
import { TicketOcrModule } from './ticket-ocr/ticket-ocr.module';
import { TagsModule } from './tags/tags.module';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config) => {
        // Log para debug
        console.log('[CONFIG] DATABASE_URL exists:', !!config.DATABASE_URL);
        console.log('[CONFIG] JWT_SECRET exists:', !!config.JWT_SECRET);
        console.log('[CONFIG] NODE_ENV:', config.NODE_ENV);
        if (!config.DATABASE_URL) {
          throw new Error('DATABASE_URL environment variable is not set');
        }
        // JWT_SECRET con default para desarrollo
        if (!config.JWT_SECRET) {
          console.warn('[CONFIG] ⚠️  JWT_SECRET not set, using default (INSEGURO - solo para desarrollo)');
          config.JWT_SECRET = 'default-insecure-jwt-secret-change-in-production';
        }
        return config;
      },
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().uri().required(),
        JWT_SECRET: Joi.string().min(16).optional(),
        ANTHROPIC_API_KEY: Joi.string().allow('').optional(),
        GEMINI_API_KEY: Joi.string().allow('').optional(),
        GROQ_API_KEY: Joi.string().allow('').optional(),
        FRONTEND_URL: Joi.string().uri().optional(),
        SMTP_HOST: Joi.string().allow('').optional(),
        SMTP_PORT: Joi.number().optional(),
        SMTP_USER: Joi.string().allow('').optional(),
        SMTP_PASS: Joi.string().allow('').optional(),
        SMTP_FROM_NAME: Joi.string().allow('').optional(),
        SMTP_FROM_EMAIL: Joi.string().allow('').optional(),
        RESEND_API_KEY: Joi.string().allow('').optional(),
        // OAuth de terceros deshabilitado temporalmente.
        // GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
        // GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
        // GOOGLE_REDIRECT_URI: Joi.string().uri().optional(),
        // APPLE_CLIENT_ID: Joi.string().allow('').optional(),
        // APPLE_CLIENT_SECRET: Joi.string().allow('').optional(),
        // APPLE_REDIRECT_URI: Joi.string().uri().optional(),
        PORT: Joi.number().default(3000),
        DB_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
        DB_SYNCHRONIZE: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(false),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // En producción NUNCA sincronizar automáticamente
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        const shouldSync = isProduction ? false : configService.get<boolean>('DB_SYNCHRONIZE') ?? false;
        
        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: shouldSync,
          ssl: configService.get<boolean>('DB_SSL')
            ? { rejectUnauthorized: false }
            : false,
        };
      },
    }),
    CategoriesModule,
    UsersModule,
    IncomesModule,
    ExpensesModule,
    AuthModule,
    BudgetsModule,
    SavingsGoalsModule,
    SavingsMovementsModule,
    NotificationsModule,
    RecommendationsModule,
    RolesModule,
    UserRolesModule,
    BalancesModule,
    MovimientosModule,
    AsesorModule,
    TicketOcrModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}
