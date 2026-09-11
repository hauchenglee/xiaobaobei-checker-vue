const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const checkText = async (originalText, dictionary = [], model = false) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/checker/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                original: originalText,
                dictionary: dictionary,
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
