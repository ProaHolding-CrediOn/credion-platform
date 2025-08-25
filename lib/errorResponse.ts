export const logError = (response: Response) => {
    console.error('Error response from backend', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
    })
}