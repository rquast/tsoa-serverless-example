import {provideSingleton} from '../ioc';
import {Company} from '../models/Company';
import {User} from '../models/User';

@provideSingleton(CompaniesService)
export class CompaniesService {
    public async get(id: number): Promise<Company> {
      return {
          id,
          name: 'test'
      };
    };

    public async getUsers(id: number): Promise<User[]> {
      return [
            {
                createdAt: new Date(),
                email: 'test@test.com',
                id: 1
            },
            {
                createdAt: new Date(),
                email: 'test2@test2.com',
                id: 2,
            }
        ];
    }
}
