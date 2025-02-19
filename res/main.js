// 音乐播放器变量
let audioPlayer;
let musicProgress;
let progressBar;
let songTitle;
let songTime;
let playlist = [];
let currentSongIndex = 0;
let isPlaying = false;

// 初始化音乐播放器
async function initMusicPlayer() {
    audioPlayer = document.getElementById('audioPlayer');
    musicProgress = document.querySelector('.music-progress');
    progressBar = document.querySelector('.progress-bar');
    songTitle = document.querySelector('.song-title');
    songTime = document.querySelector('.song-time');
    volumeSlider = document.querySelector('.volume-slider');
    volumeProgress = document.querySelector('.volume-progress');

    // 设置初始音量
    audioPlayer.volume = 0.7;
    updateVolumeProgress();

    // 加载播放列表
    await loadPlaylist();
    
    // 更新歌曲标题
    updateSongTitle();
    
    // 监听音频播放时间更新
    audioPlayer.addEventListener('timeupdate', updateProgress);
    
    // 监听进度条点击
    musicProgress.addEventListener('click', setProgress);
    
    // 监听音量滑块点击
    volumeSlider.addEventListener('click', setVolume);
    
    // 监听歌曲结束
    audioPlayer.addEventListener('ended', handleSongEnd);
}

// 设置音量
function setVolume(e) {
    const width = volumeSlider.clientWidth;
    const clickX = e.offsetX;
    const volume = clickX / width;
    audioPlayer.volume = Math.max(0, Math.min(1, volume));
    updateVolumeProgress();
}

// 更新音量进度条
function updateVolumeProgress() {
    volumeProgress.style.width = `${audioPlayer.volume * 100}%`;
}

// 格式化时间
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// 更新进度条
function updateProgress() {
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;
    const progressPercent = (currentTime / duration) * 100;
    
    progressBar.style.width = `${progressPercent}%`;
    
    // 更新时间显示
    const formattedCurrentTime = formatTime(currentTime);
    const formattedDuration = formatTime(duration);
    songTime.textContent = `${formattedCurrentTime} / ${formattedDuration}`;
}

// 设置进度
function setProgress(e) {
    const width = musicProgress.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
}

// 更新歌曲标题
function updateSongTitle() {
    if (playlist.length > 0) {
        songTitle.textContent = playlist[currentSongIndex].replace('.mp3', '');
    }
}

// 播放/暂停切换
async function togglePlay() {
    try {
        if (audioPlayer.paused) {
            await audioPlayer.play();
            document.querySelector('button[onclick="togglePlay()"]').textContent = '暂停';
        } else {
            audioPlayer.pause();
            document.querySelector('button[onclick="togglePlay()"]').textContent = '播放';
        }
    } catch (error) {
        console.error('播放控制失败:', error);
    }
}

// 上一首
function previousSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = playlist.length - 1;
    }
    loadSong();
    updatePlaylistHighlight();
}

// 下一首
function nextSong() {
    currentSongIndex++;
    if (currentSongIndex >= playlist.length) {
        currentSongIndex = 0;
    }
    loadSong();
    updatePlaylistHighlight();
}

// 处理歌曲结束
function handleSongEnd() {
    nextSong();
}

// 加载歌曲
async function loadSong() {
    try {
        songTitle.textContent = '加载中...';
        audioPlayer.src = `/music/${playlist[currentSongIndex]}`;
        
        // 等待音频加载完成
        await new Promise((resolve, reject) => {
            audioPlayer.addEventListener('canplay', resolve, { once: true });
            audioPlayer.addEventListener('error', reject, { once: true });
        });
        
        updateSongTitle();
        await audioPlayer.play();
        document.querySelector('button[onclick="togglePlay()"]').textContent = '暂停';
    } catch (error) {
        console.error('加载音乐失败:', error);
        songTitle.textContent = `加载失败: ${playlist[currentSongIndex]}`;
    }
}

// 播放指定索引的歌曲
function playSongAtIndex(index) {
    currentSongIndex = index;
    loadSong();
    updatePlaylistHighlight();
}

// 更新播放列表高亮
function updatePlaylistHighlight() {
    document.querySelectorAll('.playlist-item').forEach((item, index) => {
        item.classList.toggle('active', index === currentSongIndex);
    });
}

// 加载播放列表
async function loadPlaylist() {
    try {
        const response = await fetch('/list_music');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const files = await response.json();
        if (!Array.isArray(files) || files.length === 0) {
            throw new Error('没有找到音乐文件');
        }
        playlist = files.map(file => file.name);
        
        // 更新播放列表显示
        const playlistContainer = document.querySelector('.playlist');
        playlistContainer.innerHTML = files
            .map((file, index) => {
                const lastModified = new Date(file.last_modified * 1000).toLocaleDateString();
                const size = (file.size / (1024 * 1024)).toFixed(2);
                return `
                    <div class="playlist-item ${index === currentSongIndex ? 'active' : ''}" 
                         onclick="playSongAtIndex(${index})">
                        <div class="song-name">${file.name.replace('.mp3', '')}</div>
                        <div class="song-info">
                            <span class="song-size">${size} MB</span>
                            <span class="song-date">${lastModified}</span>
                        </div>
                    </div>
                `;
            })
            .join('');
        
        // 如果播放列表加载成功，尝试加载第一首歌
        if (playlist.length > 0) {
            loadSong();
        }
    } catch (error) {
        console.error('加载播放列表失败:', error);
        songTitle.textContent = `加载播放列表失败: ${error.message}`;
    }
}

// 页面加载完成后初始化音乐播放器
window.addEventListener('DOMContentLoaded', initMusicPlayer);

// 文章表单相关函数
function showArticleForm() {
    document.getElementById('articleForm').style.display = 'block';
}

function hideArticleForm() {
    document.getElementById('articleForm').style.display = 'none';
}

// 简介表单相关函数
function showIntroductionForm() {
    document.getElementById('introductionForm').style.display = 'block';
}

function hideIntroductionForm() {
    document.getElementById('introductionForm').style.display = 'none';
}

// 标签管理相关函数
function showTagManager() {
    document.getElementById('tagManager').style.display = 'block';
    loadTags();
}

function hideTagManager() {
    document.getElementById('tagManager').style.display = 'none';
}

// 加载标签列表
async function loadTags() {
    try {
        const response = await fetch('./tags/list.json');
        const tags = await response.json();
        // 更新标签管理器中的标签列表
        const tagList = document.getElementById('tagList');
        tagList.innerHTML = tags.map(tag => `<div class="tag">${tag}</div>`).join('');
        
        // 更新个人简介下方的标签列表
        const profileTagList = document.getElementById('profileTagList');
        profileTagList.innerHTML = tags.map(tag => `<div class="profile-tag">${tag}</div>`).join('');
    } catch (error) {
        console.error('加载标签失败:', error);
    }
}

// 处理表单提交
document.getElementById('newArticleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('articleTitle').value;
    const content = document.getElementById('articleContent').value;
    const location = document.getElementById('articleLocation').value;
    const tags = document.getElementById('articleTags').value.split(',').map(tag => tag.trim());

    const article = {
        title,
        content,
        location,
        tags,
        date: new Date().toISOString()
    };

    try {
        const response = await fetch('/save_article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(article)
        });

        if (response.ok) {
            alert('文章发布成功！');
            hideArticleForm();
            document.getElementById('newArticleForm').reset();
            // 发布成功后立即重新加载文章列表
            loadArticles();
        } else {
            throw new Error('发布失败');
        }
    } catch (error) {
        alert('发布失败：' + error.message);
    }
});

document.getElementById('newIntroductionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('introContent').value;

    try {
        const response = await fetch('/save_introduction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            alert('简介保存成功！');
            hideIntroductionForm();
            document.getElementById('newIntroductionForm').reset();
            // 保存成功后立即更新显示的简介
            loadIntroduction();
        } else {
            throw new Error('保存失败');
        }
    } catch (error) {
        alert('保存失败：' + error.message);
    }
});

document.getElementById('newTagForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTag = document.getElementById('newTag').value.trim();

    if (!newTag) return;

    try {
        const response = await fetch('./save_tag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tag: newTag })
        });

        if (response.ok) {
            alert('标签添加成功！');
            document.getElementById('newTag').value = '';
            loadTags();
        } else {
            throw new Error('添加失败');
        }
    } catch (error) {
        alert('添加失败：' + error.message);
    }
});

// 加载文章列表
async function loadArticles() {
    try {
        const response = await fetch('/article/');
        const files = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(files, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));
        const articleFiles = links
            .map(link => link.getAttribute('href'))
            .filter(href => href.endsWith('.json'));

        const articles = await Promise.all(
            articleFiles.map(async file => {
                const articleResponse = await fetch(`/article/${file}`);
                const article = await articleResponse.json();
                return { ...article, filename: file };
            })
        );

        window.articles = articles;
        displayArticles(articles);
    } catch (error) {
        console.error('加载文章失败:', error);
    }
}

// 显示文章列表
function displayArticles(articles) {
    const grid = document.getElementById('articlesGrid');
    grid.innerHTML = '';

    if (!articles || articles.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-text">这里空空如也哦~</div>
                <div class="empty-subtext">快来发布你的第一篇文章吧！</div>
            </div>
        `;
        return;
    }

    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';

        const date = new Date(article.date);
        const formattedDate = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        card.innerHTML = `
            <div class="article-title">${article.title}</div>
            <div class="article-meta">
                <div>${formattedDate}</div>
                ${article.location ? `<div>📍 ${article.location}</div>` : ''}
            </div>
            <div class="article-tags">
                ${article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
            </div>
        `;

        card.addEventListener('click', () => {
            const params = new URLSearchParams({
                title: article.title,
                date: article.date,
                location: article.location || '',
                content: article.content,
                tags: JSON.stringify(article.tags)
            });
            window.location.href = `/article/template.html?${params.toString()}`;
        });

        grid.appendChild(card);
    });
}

// 搜索文章
function searchArticles() {
    const searchTerm = document.getElementById('searchArticles').value.toLowerCase();
    const filteredArticles = window.articles.filter(article => {
        return (
            article.title.toLowerCase().includes(searchTerm) ||
            article.content.toLowerCase().includes(searchTerm) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            (article.location && article.location.toLowerCase().includes(searchTerm))
        );
    });
    displayArticles(filteredArticles);
}

// 排序文章
function sortArticles(sortType) {
    const articles = [...window.articles];
    switch (sortType) {
        case 'date-desc':
            articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            articles.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'title-asc':
            articles.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
            break;
        case 'title-desc':
            articles.sort((a, b) => b.title.localeCompare(a.title, 'zh-CN'));
            break;
    }
    displayArticles(articles);
}

// 加载个人简介
async function loadIntroduction() {
    try {
        const response = await fetch('./introduction/content.json');
        const data = await response.json();
        document.querySelector('.description').textContent = data.content;
    } catch (error) {
        console.error('加载个人简介失败:', error);
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    loadIntroduction();
});

document.getElementById('newIntroductionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('introContent').value;

    try {
        const response = await fetch('/save_introduction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            alert('简介保存成功！');
            hideIntroductionForm();
            document.getElementById('newIntroductionForm').reset();
            // 保存成功后立即更新显示的简介
            loadIntroduction();
        } else {
            throw new Error('保存失败');
        }
    } catch (error) {
        alert('保存失败：' + error.message);
    }
});

document.getElementById('newTagForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTag = document.getElementById('newTag').value.trim();

    if (!newTag) return;

    try {
        const response = await fetch('./save_tag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tag: newTag })
        });

        if (response.ok) {
            alert('标签添加成功！');
            document.getElementById('newTag').value = '';
            loadProfileTags();
        } else {
            throw new Error('添加失败');
        }
    } catch (error) {
        alert('添加失败：' + error.message);
    }
});