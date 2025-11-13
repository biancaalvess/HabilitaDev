// Fetcher function for SWR
// This function will be used by SWR to fetch data from the API

export const fetcher = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      const error = new Error('An error occurred while fetching the data.');
      // Attach extra info to the error object.
      (error as any).status = response.status;
      
      // Try to parse error response
      try {
        const errorData = await response.json();
        (error as any).info = errorData;
        (error as any).message = errorData.message || errorData.error?.message || response.statusText;
      } catch {
        (error as any).info = { message: response.statusText };
        (error as any).message = response.statusText;
      }
      
      throw error;
    }

    const data = await response.json();

    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.success && data.data) {
      return data.data;
    } else if (data.data) {
      return data.data;
    }

    return data;
  } catch (error) {
    // Re-throw error to let SWR handle it
    throw error;
  }
};

