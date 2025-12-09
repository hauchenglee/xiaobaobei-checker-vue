// [修改] 將 Base URL 改為空字串，或者直接移除
// 瀏覽器會自動將請求發送到當前的 Domain (http://srv415056.hstgr.cloud)
const API_BASE_URL = ''

export const checkText = async (originalText, dictionary = [], model = false) => {
    try {
        // 請求會變成 http://srv415056.hstgr.cloud/api/checker/check
        // Nginx 收到後會轉發給 Spring Boot
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