import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import { User } from '../model/user.model';
import { Vinyl } from '../model/vinyl.model';
import { Review } from '../model/review.model';

const isDevEnv = process.env.NODE_ENV === 'development';

export const databaseProvider = [
    {
        provide: 'SEQUELIZE',
        useFactory: async (configService: ConfigService) => {
            const dbName = configService.get<string>(
                isDevEnv ? 'DEV_DATABASE_NAME' : 'DATABASE_NAME',
            );
            const dbUser = configService.get<string>(
                isDevEnv ? 'DEV_DATABASE_USERNAME' : 'DATABASE_USERNAME',
            );
            const dbPassword = configService.get<string>(
                isDevEnv ? 'DEV_DATABASE_PASSWORD' : 'DATABASE_PASSWORD',
            );
            const dbHost = configService.get<string>(
                isDevEnv ? 'DEV_DATABASE_HOST' : 'DATABASE_HOST',
            );
            const dbPort = parseInt(
                configService.get<string>(
                    isDevEnv ? 'DEV_DATABASE_PORT' : 'DATABASE_PORT',
                ),
            );

            const sequelize = new Sequelize({
                database: dbName,
                username: dbUser,
                password: dbPassword,
                host: dbHost,
                port: dbPort,
                dialect: 'postgres',
                logging: isDevEnv ? false : console.log,
            });

            sequelize.addModels([User, Vinyl, Review]);
            
            try {
                await sequelize.sync();
            } catch (error) {
                console.error('Sequelize sync error:', error);
            }

            return sequelize;
        },
        inject: [ConfigService],
    },
];
