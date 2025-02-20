<template>
    <div class="app-wrapper">
        <div class="glass-container">
            <header>
                <h1>文本校對工具</h1>
            </header>

            <main class="editor-container">
                <section class="editor-panel">
                    <div class="panel-header">
                        <span class="panel-title">原文本</span>
                    </div>
                    <div class="panel-content" v-html="markedOriginalText"></div>
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
                <div class="button-group">
                    <button class="btn btn-outline">
                        新增詞庫
                    </button>
                    <button class="btn btn-primary">
                        送出檢查
                    </button>
                    <button class="btn btn-outline">
                        複製到剪貼簿
                    </button>
                    <button class="btn btn-secondary">
                        清除全部內容
                    </button>
                </div>
            </footer>
        </div>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue'

const corrections = {
    '软体': '軟體',
    '资讯': '資訊',
    '确定': '確定'
}

const originalText = ref('')
const correctedText = ref('')

const markText = (text, isOriginal = true) => {
    let markedText = text

    for (let wrong in corrections) {
        const correct = corrections[wrong]
        const pattern = isOriginal ? wrong : correct
        const className = isOriginal ? 'wrong' : 'correct'
        const word = isOriginal ? wrong : correct

        if (isOriginal) {
            markedText = markedText.replace(
                new RegExp(pattern, 'g'),
                `<span class="${className}">${word}</span>`
            )
        } else {
            markedText = markedText.replace(
                new RegExp(pattern, 'g'),
                `<span class="${className}" 
          data-wrong="${wrong}"
          data-correct="${correct}"
          onclick="window.toggleWord(this)">${word}</span>`
            )
        }
    }
    return markedText
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
    } else {
        element.textContent = correct
        element.className = 'correct'
    }
}

const loadSampleText = () => {
    const sampleText = "这是一个专业的网路软体，可以获取资讯。确定要涨价了吗？"
    originalText.value = sampleText
    correctedText.value = sampleText.replace(/软体/g, '軟體').replace(/资讯/g, '資訊').replace(/确定/g, '確定')
}

const clearAll = () => {
    originalText.value = ''
    correctedText.value = ''
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

// 初始加载示例文本
loadSampleText()
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

.panel-title {
    color: #333;
    font-weight: 500;
    font-size: 0.95rem;
}

.panel-subtitle {
    color: #666;
    font-size: 0.8rem;
}

.action-bar {
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between; /* 改为两端对齐 */
    align-items: center;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.9);
}

.font-size-controls {
    display: flex;
    gap: 0.5rem;
}

.button-group {
    display: flex;
    gap: 1rem;
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
    gap: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.9);
}

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
</style>