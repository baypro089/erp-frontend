import api from './api.service';

export const CacheService = {
    async refreshCache(): Promise<void> {
        await api.post('/cache/refresh');
    },
};
