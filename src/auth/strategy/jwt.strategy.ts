import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { systemLogger } from '../../utils/logger';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: (req) => {
                if (req?.cookies?.access_token) {
                    systemLogger.log('JWT extracted from cookies successfully.');
                    return req.cookies.access_token;
                }
                return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
            },
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: { sub: string; email: string; role: string }) {
        systemLogger.log('Validating JWT payload.');

        if (!payload || !payload.sub || !payload.email) {
            systemLogger.warn('Invalid token payload detected.');
            throw new UnauthorizedException('Invalid token payload');
        }

        systemLogger.log(`JWT validated for user with ID: ${payload.sub}`);
        return { id: payload.sub, email: payload.email, role: payload.role };
    }
}
