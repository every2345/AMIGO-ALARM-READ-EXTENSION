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
  let combinedOffline = [];
  let combinedError = [];
  let now = Date.now();
  
  for (let frameId in frameData) {
    if (now - frameData[frameId].timestamp < 10000) {
      combinedOffline.push(...(frameData[frameId].data.offline || []));
      combinedError.push(...(frameData[frameId].data.error || []));
    } else {
      delete frameData[frameId];
    }
  }
  return { offline: combinedOffline, error: combinedError };
}

// Chạy ngầm gửi dữ liệu sang Python mỗi 3 giây
setInterval(() => {
  let finalData = aggregateData();
  
  if (finalData.offline.length > 0 || finalData.error.length > 0) {
    fetch('http://localhost:5000/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData)
    }).catch(err => console.log("Đợi Python bật lên:", err));
  }
}, 3000);
