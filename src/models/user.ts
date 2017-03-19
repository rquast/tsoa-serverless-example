export interface User {
    id: number;
    email: string;
    createdAt: Date;
}

export interface UserCreateRequest {
    email: string;
}

export interface UserUpdateRequest {
    id: number;
    email: string;
}
