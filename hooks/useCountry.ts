import api from "@/lib/axiosInstance";
import { useState } from "react";

export function useCountry() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function getCountries() {
        const response = await api.get('countries?limit=0&sort=name');
        const data = response.data;
        return data.docs;
    }

    const fetchCountries = async () => {
        try {
            setLoading(true);
            console.log("Obteniendo paises");
            const response = await getCountries();
            return response;
        } catch (err) {
            setError("Error obteniendo paises");
            return { success: false, error: "Error al consultar paises" };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        fetchCountries
    }

}