export interface User {
    id: string;
    dateCreated: number;
}

export interface UserRepository {
    createUser(item: User): Promise<string>;
    deleteUser(id: string): Promise<boolean>;
    userExists(id: string): Promise<boolean>;
}