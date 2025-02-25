const API_BASE_URL = 'http://srv415056.hstgr.cloud:5001'

export const checkText = async (text, terms = [], model = false) => {
    try {
        const response = await fetch(`${API_BASE_URL}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                article: text,
                terms,
                model: model
            })
        });

        console.log(response)
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}