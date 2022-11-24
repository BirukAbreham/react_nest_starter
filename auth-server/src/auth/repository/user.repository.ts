import { Injectable, NotImplementedException } from '@nestjs/common';
import { DBService } from 'src/db/db.service';
import { TokenFamilyDTO } from '../dto';
import { GenericRepository } from './generic.repository';

@Injectable()
export class UserRepository<User> implements GenericRepository<User> {
    constructor(private readonly dbService: DBService) {}

    async get(id: number) {
        throw new NotImplementedException('Method not implemented');
    }

    async create(item: any) {
        try {
            const newUser = await this.dbService.user.create({ data: item });

            return newUser;
        } catch (error) {
            console.error('error', error);
        }
    }

    async update(id: number, item: any) {
        try {
            let updatedUser = await this.dbService.user.update({
                where: { id },
                data: item,
            });

            return updatedUser;
        } catch (error) {
            console.error('error', error);
        }
    }

    async remove(id: number) {
        throw new NotImplementedException('Method not implemented');
    }

    async getUser(key: number | string) {
        try {
            let user;

            if (typeof key === 'number') {
                user = await this.dbService.user.findFirst({
                    where: {
                        id: key,
                    },
                });
            } else if (typeof key === 'string') {
                user = await this.dbService.user.findFirst({
                    where: {
                        username: key,
                    },
                });
            }

            return user;
        } catch (error) {
            console.error('error', error);
        }
    }

    async updateRefreshToken(id: number, value: string | any) {
        try {
            let updateRefreshToken = await this.dbService.user.update({
                where: { id },
                data: { refreshHash: value },
            });

            return updateRefreshToken;
        } catch (error) {
            console.error('error', error);
        }
    }

    async createUserTokenFamily(tokenFamily: TokenFamilyDTO) {
        try {
            const createdFamily = await this.dbService.tokenFamily.create({
                data: tokenFamily,
            });

            return createdFamily;
        } catch (error) {
            console.error('error', error);
        }
    }

    async getAllUsedTokens(userID: number) {
        const tokenFamilies = await this.dbService.tokenFamily.findMany({
            where: { userId: userID }
        });

        return tokenFamilies;
    }
}
