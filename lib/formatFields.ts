    export const formatFieldValue = (value: any): string => {
        if (value === null) {
            return '-'
        }

        if (typeof value !== 'object') {
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

        const values = Object.values(value);
        if (values.length === 0) {
            return '-';
        }

        const results: string[] = [];
        for (const propValue of values) {
            const formatted = formatFieldValue(propValue);
            if (formatted !== '-') {
                results.push(formatted);
            }
        }

        return results.length > 0 ? results.join(', ') : '-';
    }