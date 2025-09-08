

// IMPORTANT: Replace this URL with your actual deployed backend URL.
const API_URL = 'https://biophilia-front-back.onrender.com';

export const generateText = async (prompt: string, language: 'en' | 'es'): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/generate-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, language }),
    });

    const data = await response.json();

    if (!response.ok) {
      return `Error from AI service: ${data.message || 'Unknown error'}`;
    }
    
    return data.text;
  } catch (error) {
    console.error("Error generating text:", error);
    if (error instanceof Error) {
        return `Error calling backend AI service: ${error.message}`;
    }
    return "An unknown error occurred while contacting the backend AI service.";
  }
};