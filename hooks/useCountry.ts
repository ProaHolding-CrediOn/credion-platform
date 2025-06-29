export function useCountry() {

    const fetchCountries = async () => {
        const res = await fetch('http://localhost:3000/api/countries?limit=0&sort=name');
        const data = await res.json();
        return data.docs;
    }

    return {
        fetchCountries
    }

}