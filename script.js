// 定義全局變量，這些變量在整個程序中都可以使用
let workTime = 25, // 工作時間，初始值為25分鐘
    breakTime = 5, // 休息時間，初始值為5分鐘
    timeLeft, // 剩餘時間（秒）
    isWorking = true, // 是否處於工作狀態，初始為true
    timer, // 用於存儲計時器的變量
    player, // 用於存儲YouTube播放器的變量
    videoCurrentTime = 0; // 用於存儲視頻當前播放時間

let isRunning = false, // 計時器是否正在運行
    displayedTime; // 顯示在界面上的時間（秒）

// 創建音頻對象，用於播放音效
const restAudio = new Audio('rest.mp3'); // 休息音效
const workAudio = new Audio('work.mp3'); // 工作音效

// 當YouTube API準備就緒時調用此函數
function onYouTubeIframeAPIReady() {
    // 創建一個新的YouTube播放器
    player = new YT.Player('player', {
        height: '0', // 設置播放器高度為0（隱藏）
        width: '0', // 設置播放器寬度為0（隱藏）
        events: {
            'onReady': updateVolume, // 當播放器準備好時，更新音量
            'onStateChange': onPlayerStateChange // 當播放器狀態改變時，調用onPlayerStateChange函數
        }
    });
}

// 當YouTube播放器狀態改變時調用此函數
function onPlayerStateChange(event) {
    // 如果視頻結束且處於工作狀態，則重新播放視頻
    if (event.data == YT.PlayerState.ENDED && isWorking) {
        player.seekTo(0);
        player.playVideo();
    }
    updateCurrentlyPlaying(); // 更新當前播放狀態顯示
}

// 開始計時器
function startTimer() {
    // 如果計時器未運行且輸入有效
    if (!isRunning && validateInputs()) {
        // 從輸入框獲取工作和休息時間
        workTime = parseInt(document.getElementById('workTime').value);
        breakTime = parseInt(document.getElementById('breakTime').value);
        
        // 如果timeLeft未設置，則設置為工作時間
        timeLeft = timeLeft || workTime * 60;
        displayedTime = timeLeft; // 設置顯示時間
        
        // 隱藏設置界面，顯示停止按鈕
        document.getElementById('time-settings').style.display = 'none';
        document.querySelector('.music-input').style.display = 'none';
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('stopButton').style.display = 'block';
        document.getElementById('resetButton').style.display = 'block';

        // 每秒更新一次計時器
        timer = setInterval(updateTimer, 1000);
        isRunning = true; // 設置計時器為運行狀態
        if (isWorking) playWorkAudio(); // 如果是工作狀態，播放工作音頻
        updateDisplay(); // 更新顯示
    }
}

// 停止計時器
function stopTimer() {
    clearInterval(timer); // 清除計時器
    isRunning = false; // 設置計時器為非運行狀態
    
    // 如果正在播放YouTube視頻，則暫停並記錄當前時間
    if (isYouTubeVideo() && player && player.getPlayerState) {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            videoCurrentTime = player.getCurrentTime();
            player.pauseVideo();
        }
    } else {
        // 否則暫停音頻播放
        workAudio.pause();
        restAudio.pause();
    }

    // 顯示開始按鈕，隱藏停止按鈕
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('stopButton').style.display = 'none';
    document.getElementById('resetButton').style.display = 'block';
    updateCurrentlyPlaying(); // 更新當前播放狀態顯示
    updateDisplay(); // 更新顯示
}

// 重置計時器
function resetTimer() {
    clearInterval(timer); // 清除計時器
    if (validateInputs()) { // 如果輸入有效
        // 從輸入框獲取工作和休息時間
        workTime = parseInt(document.getElementById('workTime').value);
        breakTime = parseInt(document.getElementById('breakTime').value);
        timeLeft = workTime * 60; // 設置剩餘時間為工作時間
        displayedTime = timeLeft; // 設置顯示時間
        isWorking = true; // 設置為工作狀態
        isRunning = false; // 設置計時器為非運行狀態
        videoCurrentTime = 0; // 重置視頻當前時間
        
        // 顯示所有設置界面和按鈕
        document.getElementById('time-settings').style.display = 'block';
        document.querySelector('.music-input').style.display = 'block';
        document.getElementById('startButton').style.display = 'block';
        document.getElementById('stopButton').style.display = 'none';
        document.getElementById('resetButton').style.display = 'none';
        stopAllAudio(); // 停止所有音頻播放
        updateCurrentlyPlaying(); // 更新當前播放狀態顯示
        updateDisplay(); // 更新顯示
    }
}

// 更新計時器
function updateTimer() {
    timeLeft--; // 減少剩餘時間
    displayedTime = timeLeft; // 更新顯示時間
    if (timeLeft < 0) { // 如果時間用完
        isWorking = !isWorking; // 切換工作/休息狀態
        // 根據當前狀態設置新的時間
        timeLeft = (isWorking ? workTime : breakTime) * 60;
        displayedTime = timeLeft; // 更新顯示時間
        stopAllAudio(); // 停止所有音頻播放
        isWorking ? playWorkAudio() : playRestSound(); // 根據狀態播放相應音頻
    }
    updateDisplay(); // 更新顯示
    updateCurrentlyPlaying(); // 更新當前播放狀態顯示
}

// 更新顯示
function updateDisplay() {
    const minutes = Math.floor(displayedTime / 60); // 計算分鐘數
    const seconds = displayedTime % 60; // 計算秒數
    // 更新計時器顯示，使用padStart確保始終顯示兩位數
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    // 更新狀態顯示
    document.getElementById('status').textContent = isRunning ? (isWorking ? '💼 工作時間 💼' : ' ☕ 休息時間 ☕') : '暫停計時';
}

// 更新顯示時間
function updateDisplayedTime() {
    if (!isRunning && validateInputs()) { // 如果計時器未運行且輸入有效
        workTime = parseInt(document.getElementById('workTime').value); // 獲取工作時間
        displayedTime = workTime * 60; // 設置顯示時間（轉換為秒）
        timeLeft = displayedTime; // 更新剩餘時間
        updateDisplay(); // 更新顯示
    }
}

// 從YouTube URL提取視頻ID
function extractVideoID(url) {
    // 使用正則表達式匹配YouTube URL中的視頻ID
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match && match[1]; // 返回匹配到的視頻ID，如果沒有匹配到則返回null
}

// 播放休息音效
function playRestSound() {
    restAudio.currentTime = 0; // 重置音頻到開始位置
    restAudio.play(); // 播放音頻
    // 設置一個計時器，在第一次播放結束後再播放一次
    setTimeout(() => {
        restAudio.currentTime = 0;
        restAudio.play();
    }, restAudio.duration * 1000); // 等待時間為音頻持續時間（轉換為毫秒）
}

// 播放工作音頻
function playWorkAudio() {
    const youtubeLink = document.getElementById('youtubeLink').value; // 獲取YouTube鏈接
    if (youtubeLink) { // 如果有YouTube鏈接
        const videoId = extractVideoID(youtubeLink); // 提取視頻ID
        if (videoId && player && player.loadVideoById) {
            player.loadVideoById({
                'videoId': videoId,
                'startSeconds': videoCurrentTime
            }); // 從記錄的時間點加載並播放YouTube視頻
        }
    } else {
        workAudio.currentTime = 0; // 重置音頻到開始位置
        workAudio.loop = true; // 設置循環播放
        workAudio.play().catch(error => console.error('播放工作音效時發生錯誤:', error)); // 播放音頻，如果出錯則輸出錯誤信息
    }
}

// 檢查是否使用YouTube視頻
function isYouTubeVideo() {
    return document.getElementById('youtubeLink').value !== ''; // 如果YouTube鏈接不為空，則返回true
}

// 停止所有音頻
function stopAllAudio() {
    // 如果YouTube播放器正在播放，則暫停並記錄當前時間
    if (player && player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING) {
        videoCurrentTime = player.getCurrentTime();
        player.pauseVideo();
    }
    workAudio.pause(); // 暫停工作音頻
    restAudio.pause(); // 暫停休息音頻
}

// 更新當前播放狀態顯示
function updateCurrentlyPlaying() {
    const currentlyPlayingElement = document.getElementById('currentlyPlaying');
    // 如果正在播放YouTube視頻
    if (isYouTubeVideo() && player && player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING) {
        currentlyPlayingElement.textContent = `正在播放: ${player.getVideoData().title}`; // 顯示視頻標題
    } else if (!isYouTubeVideo() && !workAudio.paused) { // 如果正在播放工作音頻
        currentlyPlayingElement.textContent = '正在播放: work.mp3';
    } else {
        currentlyPlayingElement.textContent = ''; // 如果沒有播放任何內容，清空顯示
    }
}

// 更新音量
function updateVolume() {
    const volume = document.getElementById('volume').value; // 獲取音量值
    if (player && player.setVolume) player.setVolume(volume); // 設置YouTube播放器音量
    workAudio.volume = restAudio.volume = volume / 100; // 設置音頻音量（轉換為0-1範圍）
}

// 驗證輸入
function validateInputs() {
    // 獲取輸入的工作和休息時間
    const workTimeValue = parseInt(document.getElementById('workTime').value);
    const breakTimeValue = parseInt(document.getElementById('breakTime').value);
    // 檢查是否為有效的正整數
    if (isNaN(workTimeValue) || isNaN(breakTimeValue) || workTimeValue <= 0 || breakTimeValue <= 0) {
        alert('請輸入有效的正整數作為工作時間和休息時間！'); // 如果無效，顯示警告
        return false;
    }
    return true; // 如果有效，返回true
}

// 當DOM加載完成時執行
document.addEventListener('DOMContentLoaded', function() {
    updateDisplayedTime(); // 更新顯示時間
    // 為各個元素添加事件監聽器
    document.getElementById('workTime').addEventListener('input', updateDisplayedTime);
    document.getElementById('breakTime').addEventListener('input', updateDisplayedTime);
    document.getElementById('startButton').addEventListener('click', startTimer);
    document.getElementById('stopButton').addEventListener('click', stopTimer);
    document.getElementById('stopButton').style.display = 'none';
    document.getElementById('resetButton').addEventListener('click', resetTimer);
    document.getElementById('resetButton').style.display = 'none';
    document.getElementById('volume').addEventListener('input', updateVolume);
});