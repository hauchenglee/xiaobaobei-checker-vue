const API_BASE_URL = 'http://127.0.0.1:5000'

export const checkText = async (text, terms = [], context = false) => {
    try {
        const response = await fetch(`${API_BASE_URL}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                article: text,
                terms,
                context
            })
        });

        console.log(response)
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}