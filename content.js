// --- content.js ---
function scrapeDeviceData() {
  let normal = [];
  let error = [];
  const deviceNodes = document.querySelectorAll('.site-sensor'); 

  deviceNodes.forEach((node) => {
    let deviceId = node.id || "Unknown_ID";
    let deviceName = "Thiết bị không tên";
    let nameElement = node.querySelector('span[id$="_serialNumber"]');
    if (nameElement && nameElement.innerText) { deviceName = nameElement.innerText.trim(); }

    let siteName = "Khu vực không xác định";
    let siteContainer = node.closest('.marker-popup-aeon-content') || node.closest('.leaflet-container');
    if (siteContainer) {
      let siteSpan = siteContainer.querySelector('span[style*="font-weight: bold"]') || siteContainer.querySelector('span[style*="font-weight"]');
      if (siteSpan && siteSpan.innerText) { siteName = siteSpan.innerText.trim(); }
    }

    let isNormal = true;
    let sensorDiv = node.querySelector('.circle-sensor'); 
    if (sensorDiv) {
      let alarmStatus = sensorDiv.getAttribute('alarm');
      if (alarmStatus === 'alarm') { isNormal = false; } 
      else if (alarmStatus === 'normal') { isNormal = true; }
    }

    let deviceInfo = { id: deviceId, name: deviceName, site: siteName };
    if (isNormal) { normal.push(deviceInfo); } else { error.push(deviceInfo); }
  });

  return { normal, error };
}

// Chủ động gửi dữ liệu tìm được về file chạy nền (background.js)
setInterval(() => {
  let data = scrapeDeviceData();
  // Chỉ gửi khi iframe này thực sự chứa thiết bị
  if (data.normal.length > 0 || data.error.length > 0) {
    chrome.runtime.sendMessage({
      action: "report_data",
      data: data
    });
  }
}, 2500);