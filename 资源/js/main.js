// ===== 侧边栏导航高亮 =====
function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return; // 文章页面没有 section[id]，跳过避免冲突
    const navLinks = document.querySelectorAll('.sidebar nav a');
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 120;
        const bottom = top + section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bottom) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveLink);
window.addEventListener('load', updateActiveLink);

// ===== 批注面板功能 =====
const panel = document.getElementById('annotationPanel');
const panelTitle = document.getElementById('annotationTitle');
const panelBody = document.getElementById('annotationBody');
const panelClose = document.getElementById('annotationClose');
const mainEl = document.querySelector('.main');
const footerEl = document.querySelector('footer');

const annotations = {
    'kahn': {
        title: 'KAHN 算法',
        body: `<span class="tag tag-blue">算法原理</span>
<p><strong>KAHN 算法</strong> 是一种基于入度的拓扑排序算法，用于 DAG 图的并行调度。</p>
<ul>
    <li><strong>核心思想：</strong>入度为 0 的节点没有前置依赖，可以直接执行</li>
    <li><strong>执行流程：</strong>执行节点 → 将其指向节点的入度减 1 → 产生新的可执行节点</li>
    <li><strong>优势：</strong>节点可以分批并行执行，比 Claude Code 的串行判断策略并行度更高</li>
</ul>`
    },
    'sdd': {
        title: 'SDD',
        body: `<span class="tag tag-green">开发方法</span>
<p><strong>SDD</strong>（Source-Driven Development）是一种基于官方文档驱动的开发方式。</p>
<ul>
    <li>以官方文档为唯一权威来源</li>
    <li>确保代码遵循最新最佳实践</li>
    <li>避免使用过时或错误的第三方教程</li>
</ul>`
    },
    'vibecoding': {
        title: 'Vibecoding',
        body: `<span class="tag tag-orange">编程方式</span>
<p><strong>Vibecoding</strong> 是一种通过 AI 对话驱动的编程方式。</p>
<ul>
    <li>开发者用自然语言描述需求</li>
    <li>AI 生成代码实现</li>
    <li>开发者负责审查、测试和调整</li>
    <li>本项目 99% 的代码都是 vibecoding 产出</li>
</ul>`
    },
    'rerank': {
        title: 'ReRank',
        body: `<span class="tag tag-blue">检索技术</span>
<p><strong>ReRank</strong>（重排序）是信息检索中的关键技术。</p>
<ul>
    <li><strong>第一阶段：</strong>用轻量级方法快速召回候选文档</li>
    <li><strong>第二阶段：</strong>用更精确的模型对候选文档重新排序</li>
    <li><strong>效果：</strong>显著提升排序质量和召回准确率</li>
</ul>`
    }
};

function openAnnotation(key) {
    const data = annotations[key];
    if (!data) return;
    panelTitle.textContent = data.title;
    panelBody.innerHTML = data.body;
    panel.classList.add('open');
    mainEl.classList.add('shrink');
    footerEl.classList.add('shrink');
}

function closeAnnotation() {
    panel.classList.remove('open');
    mainEl.classList.remove('shrink');
    footerEl.classList.remove('shrink');
}

if (panelClose) {
    panelClose.addEventListener('click', closeAnnotation);
}

document.addEventListener('click', function(e) {
    const annotate = e.target.closest('.annotate');
    if (annotate) {
        e.preventDefault();
        const key = annotate.dataset.annotation;
        if (key) {
            openAnnotation(key);
        }
    }
});

if (panel) {
    document.addEventListener('click', function(e) {
        if (panel.classList.contains('open') && !panel.contains(e.target) && !e.target.closest('.annotate')) {
            closeAnnotation();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
            closeAnnotation();
        }
    });
}
