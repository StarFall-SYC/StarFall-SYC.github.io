// 照片数据
const photos = [
    {
        url: 'https://picsum.photos/400/300',  // 这里替换为实际的照片URL
        caption: '我们的第一张合照'
    },
    {
        url: 'https://picsum.photos/400/300',
        caption: '第一次约会'
    },
    {
        url: 'https://picsum.photos/400/300',
        caption: '一起看日落'
    }
];

// 时间线数据
const timeline = [
    {
        date: '2024-01-01',
        title: '我们相遇了',
        description: '这是我们故事的开始'
    },
    {
        date: '2024-01-15',
        title: '第一次约会',
        description: '一起看了电影，吃了美食'
    },
    {
        date: '2024-02-14',
        title: '第一个情人节',
        description: '永远记得这个特别的日子'
    }
];

// 渲染照片墙
function renderPhotoGallery() {
    const photoGrid = document.getElementById('photo-grid');
    photos.forEach(photo => {
        const col = document.createElement('div');
        col.className = 'col-md-4 animate__animated animate__fadeIn';
        col.innerHTML = `
            <div class="card">
                <img src="${photo.url}" class="card-img-top" alt="${photo.caption}">
                <div class="card-body">
                    <p class="card-text text-center">${photo.caption}</p>
                </div>
            </div>
        `;
        photoGrid.appendChild(col);
    });
}

// 渲染时间线
function renderTimeline() {
    const timelineContainer = document.getElementById('story-timeline');
    timeline.forEach((event, index) => {
        const item = document.createElement('div');
        item.className = `timeline-item ${index % 2 === 0 ? 'left' : 'right'} animate__animated animate__fadeIn`;
        const date = new Date(event.date);
        const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        item.innerHTML = `
            <div class="timeline-content">
                <h3>${event.title}</h3>
                <p class="date">${formattedDate}</p>
                <p>${event.description}</p>
            </div>
        `;
        timelineContainer.appendChild(item);
    });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    renderPhotoGallery();
    renderTimeline();
});