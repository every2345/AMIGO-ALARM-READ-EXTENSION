// --- background.js ---
let frameData = {}; // Kho lưu trữ tạm từ các iframe gửi về

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  // 1. Ghi nhận dữ liệu từ các iframe (có gắn kèm thời gian gửi)
  if (request.action === "report_data" && sender.frameId !== undefined) {
    frameData[sender.frameId] = {
      data: request.data,
      timestamp: Date.now()
    };
  }
  
  // 2. Trả dữ liệu cho Extension (popup.js) khi bạn click mở nó lên
  if (request.action === "get_latest_data") {
    sendResponse(aggregateData());
  }
});

// Hàm gộp thiết bị từ các iframe lại
function aggregateData() {
  let combinedNormal = [];
  let combinedError = [];
  let now = Date.now();
  
  for (let frameId in frameData) {
    // Chỉ lấy dữ liệu mới (loại bỏ dữ liệu rác nếu iframe đó đã bị đóng/reload quá 10 giây trước)
    if (now - frameData[frameId].timestamp < 10000) {
      combinedNormal.push(...frameData[frameId].data.normal);
      combinedError.push(...frameData[frameId].data.error);
    } else {
      delete frameData[frameId];
    }
  }
  return { normal: combinedNormal, error: combinedError };
}

// 3. CHẠY NGẦM: Bắn dữ liệu đã gom về phần mềm Python mỗi 3 giây
setInterval(() => {
  let finalData = aggregateData();
  
  if (finalData.normal.length > 0 || finalData.error.length > 0) {
    fetch('http://localhost:5000/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData)
    }).catch(err => console.log("Đợi Python bật lên:", err));
  }
}, 3000);