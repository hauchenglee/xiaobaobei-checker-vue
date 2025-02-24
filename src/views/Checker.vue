<template>
    <div class="app-wrapper">
        <!-- 添加 Loading 遮罩 -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
        </div>

        <!-- 添加 Toast 组件 -->
        <div
            v-if="showToast"
            class="toast-container"
            :class="{ 'toast-show': showToast }"
        >
            <div class="toast-content">
                <span>{{ toastMessage }}</span>
            </div>
        </div>


        <div class="glass-container">
            <header>
                <h1>文本校對工具</h1>
            </header><!-- 添加词库模态窗口 -->
            <div v-if="showDictionaryModal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>自定義詞庫</h2>
                        <button class="modal-close" @click="closeDictionaryModal">×</button>
                    </div>
                    <div class="modal-content">
                        <p class="modal-description">每行輸入一個詞，系統會自動處理格式</p>
                        <textarea
                            v-model="dictionaryInput"
                            class="dictionary-input"
                            placeholder="範例：
低收入戶
中低收入戶
身心障礙證明"
                        ></textarea>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" @click="closeDictionaryModal">取消</button>
                        <button class="btn btn-primary" @click="saveDictionary">確定</button>
                    </div>
                </div>
            </div>

            <main class="editor-container">
                <section class="editor-panel">
                    <div class="panel-header">
                        <span class="panel-title">原文本</span>
                    </div>
                    <textarea
                        class="panel-content"
                        v-model="originalText"
                        placeholder="請輸入要校對的文本..."
                    ></textarea>
                </section>

                <div class="divider"></div>

                <section class="editor-panel">
                    <div class="panel-header">
                        <span class="panel-title">校對结果</span>
                        <span class="panel-subtitle">點擊綠色文字切換</span>
                    </div>
                    <div class="panel-content" v-html="markedCorrectedText"></div>
                </section>
            </main>

            <footer class="action-bar">
                <div class="font-size-controls">
                    <button
                        v-for="size in fontSizes"
                        :key="size.value"
                        :class="['btn', 'btn-font', currentFontSize === size.value ? 'btn-font-active' : '']"
                        @click="setFontSize(size.value)"
                    >
                        {{ size.label }}
                    </button>
                </div>
                <div class="toggle-container">
                    <label class="toggle">
                        <input
                            type="checkbox"
                            v-model="isAI"
                        >
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">使用AI模型</span>
                </div>
                <div class="button-group">
                    <button class="btn btn-outline" @click="openDictionaryModal">
                        新增詞庫
                    </button>
                    <button class="btn btn-primary" @click="handleCheck">
                        送出檢查
                    </button>
                    <button class="btn btn-outline" @click="copyToClipboard">
                        複製校對文本
                    </button>
                    <button class="btn btn-secondary" @click="clearAll">
                        清除全部內容
                    </button>
                </div>
            </footer>
        </div>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import {checkText} from '../services/api'

const corrections = ref([])
const originalText = ref('')
const correctedText = ref('')
const isAI = ref(false)

const isLoading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

// 词库相关状态
const showDictionaryModal = ref(false)
const defaultTerms = [
    "低收入戶",
    "中低收入戶",
    "身心障礙證明",
    "身心障礙者生活補助",
    "育兒津貼",
    "托育補助",
    "人籍合一",
    "設籍並居住",
    "未有",
    "案主",
    "案家",
    "身心障礙者生活補助",
    "罹患重傷病",
    "非自願離職",
    "衛福部",
    "國民年金",
    "遺屬年金",
    "原則上",
    "審核",
    "洽詢"
];
const dictionaryInput = ref('')
const dictionary = ref(defaultTerms)

// 追蹤最終文本
const resultText = ref(correctedText.value);

// 打开词库模态窗口
const openDictionaryModal = () => {
    dictionaryInput.value = dictionary.value.join('\n')
    showDictionaryModal.value = true
}

// 关闭词库模态窗口
const closeDictionaryModal = () => {
    showDictionaryModal.value = false
}

// 保存词库
const saveDictionary = () => {
    const words = dictionaryInput.value
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0)
        .filter((word, index, self) => self.indexOf(word) === index); // 去重

    dictionary.value = words
    showToastMessage('詞庫已更新')
    closeDictionaryModal()
}

// 添加 Toast 控制函数
const showToastMessage = (message, duration = 2000) => {
    toastMessage.value = message
    showToast.value = true
    setTimeout(() => {
        showToast.value = false
    }, duration)
}

const markText = (text, isOriginal = true) => {
    if (!text) return '';
    let result = text;

    // 确保 corrections.value 是数组
    if (!Array.isArray(corrections.value) || corrections.value.length === 0) {
        return result;
    }

    // 从后向前处理错误，避免位置偏移
    [...corrections.value]
        .sort((a, b) => b.position - a.position)
        .forEach(error => {
            const {position, original, correction} = error;
            const word = isOriginal ? original : correction;
            const className = isOriginal ? 'wrong' : 'correct';

            const before = result.slice(0, position);
            const after = result.slice(position + original.length);

            if (isOriginal) {
                result = before +
                    `<span class="${className}">${word}</span>` +
                    after;
            } else {
                result = before +
                    `<span class="${className}" 
                            data-wrong="${original}" 
                            data-correct="${correction}" 
                            onclick="window.toggleWord(this)">${word}</span>` +
                    after;
            }
        });

    return result;
}

const markedOriginalText = computed(() => markText(originalText.value, true))
const markedCorrectedText = computed(() => markText(correctedText.value, false))

// 需要将toggleWord方法挂载到window上，因为我们在innerHTML中使用了onclick
window.toggleWord = (element) => {
    const wrong = element.dataset.wrong
    const correct = element.dataset.correct

    if (element.textContent === correct) {
        element.textContent = wrong
        element.className = 'wrong'

        // 更新最終文本
        resultText.value = resultText.value.replace(correct, wrong);
    } else {
        element.textContent = correct
        element.className = 'correct'

        // 更新最終文本
        resultText.value = resultText.value.replace(wrong, correct);
    }
}

const handleCheck = async () => {
    if (!originalText.value.trim()) {
        showToastMessage('請輸入要校對的文本')
        return
    }

    isLoading.value = true
    try {
        const result = await checkText(
            originalText.value,
            dictionary.value, // 使用动态词库
            isAI.value
        );

        if (result.status === 'success') {
            correctedText.value = result.corrected_text
            corrections.value = result.errors
            showToastMessage('校對完成')
        }
    } catch (error) {
        console.error('Check failed:', error)
        showToastMessage('校對失敗，請重試')
    } finally {
        isLoading.value = false
    }
}

const clearAll = () => {
    originalText.value = ''
    correctedText.value = ''
    corrections.value = [] // 添加这行，重置 corrections 为空数组
    showToastMessage('已清除全部內容')
}

// 添加字体大小控制
const fontSizes = [
    {label: '小', value: '1.25rem'},
    {label: '中', value: '1.5rem'},
    {label: '大', value: '2rem'},
    {label: '特大', value: '3rem'}
];

const currentFontSize = ref('1.5rem'); // 默认中字体

const setFontSize = (size) => {
    currentFontSize.value = size;
};

// 添加复制到剪贴板功能
const copyToClipboard = async () => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(resultText.value);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = resultText.value;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            const success = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (!success) throw new Error('execCommand failed');
        }
        showToastMessage('已成功複製到剪貼簿！');
    } catch (err) {
        console.error('複製失敗:', err);
        showToastMessage('複製失敗，請重試');
    }
};
</script>

<style scoped>
.app-wrapper {
    position: fixed; /* 修复偏移 */
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    overflow: hidden; /* 防止出现滚动条 */
}

.glass-container {
    width: 95vw;
    height: 90vh;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.9);
}

h1 {
    color: #333;
    font-size: 1.5rem;
    font-weight: 500;
    text-align: center;
    margin: 0;
    letter-spacing: 0.5px;
}

.editor-container {
    display: flex;
    flex: 1;
    min-height: 0;
    position: relative;
}

.editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.panel-header {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.95);
}

textarea.panel-content {
    resize: none;
    border: none;
    outline: none;
    background: rgba(255, 255, 255, 0.8);
    font-family: inherit;
}

.panel-title {
    color: #333;
    font-weight: 500;
    font-size: 1em;
}

.panel-subtitle {
    color: #666;
    font-size: 1rem;
}

.font-size-controls {
    display: flex;
    gap: 0.5rem;
}

.btn-font {
    padding: 0.4rem 0.8rem;
    background: white;
    color: #666;
    border: 1px solid #ddd;
    font-size: 0.85rem;
}

.btn-font:hover {
    background: #f5f5f5;
}

.btn-font-active {
    background: #e5e7eb;
    color: #333;
    border-color: #999;
}

.panel-content {
    flex: 1;
    padding: 1.5rem;
    color: #2c3e50;
    font-size: v-bind(currentFontSize);
    line-height: 2;
    overflow-y: auto;
    letter-spacing: 0.3px;
    background: rgba(255, 255, 255, 0.8);
}

.panel-content::-webkit-scrollbar {
    width: 6px;
}

.panel-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
}

.panel-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
}

.divider {
    width: 1px;
    background: linear-gradient(
        to bottom,
        transparent,
        rgba(0, 0, 0, 0.1),
        transparent
    );
}

.action-bar {
    padding: 1rem 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.9);
}

/* 是否使用AI */

.toggle-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.toggle-label {
    color: #666;
    font-size: 0.9rem;
    font-weight: 500;
}

.toggle {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
}

.toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(203, 213, 225, 0.8);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: .4s;
    border-radius: 24px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    background: white;
    transition: .4s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle input:checked + .toggle-slider {
    background: rgba(59, 130, 246, 0.8);
}

.toggle input:checked + .toggle-slider:before {
    transform: translateX(24px);
}

/* btn */

.btn {
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    border: none;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #3b82f6;
    color: white;
    border: 1px solid transparent;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-secondary {
    background: white;
    color: #dc2626;
    border: 1px solid #dc2626;
}

.btn-secondary:hover {
    background: #fee2e2;
}

.btn-outline {
    background: white;
    color: #3b82f6;
    border: 1px solid #3b82f6;
}

.btn-outline:hover {
    background: #eff6ff;
}

.button-group {
    display: flex;
    gap: 0.75rem;
}

:deep(.wrong) {
    background: rgba(248, 113, 113, 0.4); /* 加深红色背景 */
    padding: 0.2rem 0.5rem; /* 增加内边距 */
    border-radius: 4px;
    transition: all 0.2s ease;
    border: 1px solid rgba(248, 113, 113, 0.6); /* 添加边框 */
    color: #dc2626; /* 文字改为红色 */
    font-weight: 500; /* 加粗文字 */
}

:deep(.correct) {
    background: rgba(74, 222, 128, 0.4); /* 加深绿色背景 */
    padding: 0.2rem 0.5rem; /* 增加内边距 */
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(74, 222, 128, 0.6); /* 添加边框 */
    color: #15803d; /* 文字改为绿色 */
    font-weight: 500; /* 加粗文字 */
}

:deep(.correct:hover) {
    background: rgba(74, 222, 128, 0.5); /* 加深悬停效果 */
    transform: scale(1.05); /* 悬停时略微放大 */
}

/* Loading 样式 */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* Toast 样式 */
.toast-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    z-index: 1001;
    opacity: 0;
    transition: all 0.3s ease;
}

.toast-show {
    transform: translateX(-50%) translateY(-50%);
    opacity: 1;
}

.toast-content {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    backdrop-filter: blur(8px);
}

/* 模态窗口样式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
}

.modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: 500;
    color: #333;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    padding: 0.5rem;
    margin: -0.5rem;
    line-height: 1;
}

.modal-content {
    padding: 1.5rem;
}

.modal-description {
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.dictionary-input {
    width: 100%;
    min-height: 200px;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    resize: vertical;
    font-family: inherit;
    line-height: 1.5;
}

.modal-footer {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}
</style>