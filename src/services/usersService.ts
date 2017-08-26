import {provideSingleton} from '../ioc';
import {User, UserCreateRequest, UserUpdateRequest} from '../models/User';

@provideSingleton(UsersService)
export class UsersService {
    public async get(id: number): Promise<User> {
        return {
            createdAt: new Date(),
            email: 'test',
            id: id
        };
    }

    public async create(request: UserCreateRequest): Promise<User> {
      return {
        createdAt: new Date(),
        email: request.email,
        id: 666
      };
    }

    public async update(request: UserUpdateRequest): Promise<User> {
      return {
        createdAt: new Date(),
        email: request.email,
        id: request.id
      };
    }
}
