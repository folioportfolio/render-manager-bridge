export interface ApiKey {
    apiKey: string;
    userId: string;
    dateCreated: number;
    revoked: boolean;
}

export interface ApiKeyRepository {
    createApiKey(item: Omit<ApiKey, "apiKey">): Promise<string>;
    deleteApiKey(apiKey: string, userId: string): Promise<boolean>;
    getApiKeysForUser(userId: string): Promise<ApiKey[] | null>;
    getUserForApiKey(apiKey: string): Promise<string | null>;
}
