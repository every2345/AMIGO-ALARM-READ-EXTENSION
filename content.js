// --- content.js ---
function scrapeDeviceData() {
  let offline = [];
  let error = [];
  const deviceNodes = document.querySelectorAll('.site-sensor'); 

  deviceNodes.forEach((node) => {
    let deviceId = node.id || "Unknown_ID";
    let deviceName = "Thiết bị không tên";
    let nameElement = node.querySelector('span[id$="_serialNumber"]');
    if (nameElement && nameElement.innerText) { 
      deviceName = nameElement.innerText.trim(); 
    }

    let siteName = "Khu vực không xác định";
    let siteContainer = node.closest('.marker-popup-aeon-content') || node.closest('.leaflet-container');
    if (siteContainer) {
      let siteSpan = siteContainer.querySelector('span[style*="font-weight: bold"]') || siteContainer.querySelector('span[style*="font-weight"]');
      if (siteSpan && siteSpan.innerText) { 
        siteName = siteSpan.innerText.trim(); 
      }
    }

    let statusType = null; // 'offline' hoặc 'error' (Bỏ qua màu xanh lá)
    let dotColor = "";

    let colorElement = node.querySelector('.circle-sensor-svg-inner') || node.querySelector('.circle-sensor');
    if (colorElement) {
      let strokeColor = colorElement.style.stroke || window.getComputedStyle(colorElement).stroke || '';
      let fillColor = colorElement.style.fill || window.getComputedStyle(colorElement).fill || '';
      
      // 1. Kiểm tra màu đỏ (Sự cố)
      if (strokeColor.includes('216, 67, 21') || strokeColor.includes('rgb(216') || strokeColor.includes('244, 67, 54') || strokeColor.includes('red')) {
        dotColor = 'rgb(216, 67, 21)';
        statusType = 'error';
      } 
      // 2. Kiểm tra màu xám (Mất kết nối)
      else if (strokeColor.includes('117, 117, 117') || strokeColor.includes('gray') || strokeColor.includes('128') || strokeColor.includes('150') || strokeColor.includes('160') || strokeColor.includes('180') || fillColor.includes('gray')) {
        dotColor = 'rgb(117, 117, 117)';
        statusType = 'offline';
      }
      // Các thiết bị màu xanh lá sẽ không gán statusType nên bị bỏ qua
    }

    if (statusType) {
      let deviceInfo = { id: deviceId, name: deviceName, site: siteName, color: dotColor };
      if (statusType === 'offline') {
        offline.push(deviceInfo);
      } else if (statusType === 'error') {
        error.push(deviceInfo);
      }
    }
  });

  return { offline, error };
}

// Chủ động gửi dữ liệu về background.js
setInterval(() => {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      let data = scrapeDeviceData();
      if (data.offline.length > 0 || data.error.length > 0) {
        chrome.runtime.sendMessage({
          action: "report_data",
          data: data
        }).catch(() => {});
      }
    }
  } catch (e) {}
}, 2500);
