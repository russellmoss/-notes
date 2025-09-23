export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(input as any, init)
  } catch (e) {
    return null
  }
}


