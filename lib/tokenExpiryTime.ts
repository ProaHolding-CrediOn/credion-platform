export const getJwtExpiryDate = (token: string): Date | null => {
    try {
        if (!token || typeof token !== 'string') return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        if (!payload.exp) return null;
        return new Date(payload.exp * 1000);
    } catch (error) {
        console.error('Error al decodificar JWT:', error);
        return null;
    }
};