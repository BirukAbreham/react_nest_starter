import { NotImplementedException } from '@nestjs/common';
import { GenericRepository } from './generic.repository';

let users = [];

let usedTokens = [];

export type User = {
    id?: number;

    username: string;

    email: string;

    password: string;

    refresh_hash?: string;
};

export type TokenFamily = {
    id?: number;

    user_id: number;

    hash_token: string;
};

export class UserRepository<User> implements GenericRepository<User> {
    async get(id: number): Promise<User> {
        throw new NotImplementedException('Method not implemented');
    }

    async create(item: User): Promise<any> {
        users.sort((user, _user) => {
            if (user.id < _user.id) return -1;

            if (user.id > _user.id) return 1;

            return 0;
        });

        let newUser: User;

        if (users.length) {
            newUser = {
                id: users[users.length - 1].id + 1,
                ...item,
                refresh_hash: null,
            };
        } else {
            newUser = {
                id: 1,
                ...item,
                refresh_hash: null,
            };
        }

        users.push(newUser);

        return newUser;
    }

    async update(id: number, item: any) {
        throw new NotImplementedException('Method not implemented');
    }

    async remove(id: number) {
        throw new NotImplementedException('Method not implemented');
    }

    async getUser(key: number | string): Promise<User> {
        let user;

        if (typeof key === 'number') {
            user = users.find((_user) => _user.id === key);
        }

        if (typeof key === 'string') {
            user = users.find((_user) => _user.username === key);
        }

        return user;
    }

    async updateRefreshToken(id: number, value: string | any): Promise<any> {
        let change = false;

        users.forEach((_user) => {
            if (_user.id === id) {
                _user.refresh_hash = value;
                change = true;
            }
        });

        return change
            ? { message: `user refresh updated` }
            : { message: `user could not be found` };
    }

    async getAllUsedTokens(userID: number) {
        let userTokenFamilies = usedTokens.filter(
            (tokenFamily) => tokenFamily.user_id === userID,
        );

        return userTokenFamilies;
    }

    async createUserTokenFamily(tokenFamily: TokenFamily) {
        let added;

        if (usedTokens.length === 0) {
            added = usedTokens.push({ id: 1, ...tokenFamily });

            return added; 
        }

        let lastIdx = usedTokens.length;

        added = usedTokens.push({ id: lastIdx + 1, ...tokenFamily });

        return added;
    }
}
