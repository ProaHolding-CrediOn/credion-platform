export const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) {
        return '-';
    }

    if (typeof value !== 'object' || value instanceof Date) {
        const str = String(value).trim();
        return str === '' ? '-' : str;
    }

    if (Array.isArray(value)) {
        const results: string[] = [];

        for (const item of value) {
            const formatted = formatFieldValue(item);
            if (formatted !== '-') {
                results.push(formatted);
            }
        }

        return results.length > 0 ? results.join(', ') : '-';
    }

    if ('label' in value && 'value' in value) {
        return formatFieldValue(value.value);
    }

    const entries = Object.entries(value).filter(([key]) => key !== 'id');
    if (entries.length === 0) {
        return '-';
    }

    const results: string[] = [];
    for (const [key, propValue] of entries) {
        const formatted = formatFieldValue(propValue);
        if (formatted !== '-') {
            results.push(formatted);
        }
    }

    return results.length > 0 ? results.join(', ') : '-';
};