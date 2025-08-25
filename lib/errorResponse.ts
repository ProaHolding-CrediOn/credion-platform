export const logError = async (response: Response) => {
  try {
    const raw = await response.text()
    let parsed: unknown

    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = raw
    }

    console.error("Error response from backend", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      body: parsed,
    })
  } catch (err) {
    console.error("Error response from backend (sin body)", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      error: err,
    })
  }
}
