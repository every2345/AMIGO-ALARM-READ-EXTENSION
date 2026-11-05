// --- background.js ---
let frameData = {}; 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "report_data" && sender.frameId !== undefined) {
    frameData[sender.frameId] = {
      data: request.data,
      timestamp: Date.now()
    };
  }
  
  if (request.action === "get_latest_data") {
    sendResponse(aggregateData());
  }
});

function aggregateData() {
  let combinedNormal = [];
  let combinedOffline = [];
  let combinedError = [];
  let now = Date.now();
  
  for (let frameId in frameData) {
    if (now - frameData[frameId].timestamp < 10000) {
      combinedNormal.push(...(frameData[frameId].data.normal || []));
      combinedOffline.push(...(frameData[frameId].data.offline || []));
      combinedError.push(...(frameData[frameId].data.error || []));
    } else {
      delete frameData[frameId];
    }
  }
  return { normal: combinedNormal, offline: combinedOffline, error: combinedError };
}

// Gửi dữ liệu sang Python sử dụng IP động được cấu hình
setInterval(() => {
  let finalData = aggregateData();
  
  if (finalData.offline.length > 0 || finalData.error.length > 0 || finalData.normal.length > 0) {
    chrome.storage.local.get(['serverIp'], (result) => {
      let ip = result.serverIp || '127.0.0.1'; // Mặc định là 127.0.0.1 để tránh mọi lỗi IP ảo
      let targetUrl = `http://${ip}:5000/update`;

      fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offline: finalData.offline, error: finalData.error })
      }).catch(err => console.log("Không kết nối được tới Python tại IP:", ip));
    });
  }
}, 3000);