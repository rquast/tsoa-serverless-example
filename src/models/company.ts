import {User} from './user';

export interface Company {
    id: number;
    address?: string;
    name: string;
    users?: User[];
    fields?: string[];
}
