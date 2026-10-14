// --- popup.js ---
document.addEventListener('DOMContentLoaded', function() {
  const btnNormal = document.getElementById('btn-normal');
  const btnError = document.getElementById('btn-error');
  const contentNormal = document.getElementById('content-normal');
  const contentError = document.getElementById('content-error');
  const scanBtn = document.getElementById('scan-btn');

  let isFirstLoad = true;

  function switchTab(showNormal) {
    if (showNormal) {
      btnNormal.classList.add('active');
      btnError.classList.remove('active');
      contentNormal.classList.add('active');
      contentError.classList.remove('active');
    } else {
      btnNormal.classList.remove('active');
      btnError.classList.add('active');
      contentNormal.classList.remove('active');
      contentError.classList.add('active');
    }
  }

  btnNormal.addEventListener('click', () => switchTab(true));
  btnError.addEventListener('click', () => switchTab(false));

  // GỌI DỮ LIỆU TỪ BACKGROUND.JS THAY VÌ TỰ QUÉT
  function fetchAndDisplayData() {
    chrome.runtime.sendMessage({ action: "get_latest_data" }, (response) => {
      if (response) {
        displayData(response.normal, response.error);
      }
    });
  }

  function groupBySite(devices) {
    return devices.reduce((acc, device) => {
      const site = device.site || "Khu vực không xác định";
      if (!acc[site]) acc[site] = [];
      acc[site].push(device);
      return acc;
    }, {});
  }

  function renderGroupedList(container, devices, isError = false) {
    const openHeaders = container.querySelectorAll('.site-header.is-open');
    const currentlyOpenSites = new Set(Array.from(openHeaders).map(h => h.dataset.site));

    container.innerHTML = '';

    if (devices.length === 0) {
      const emptyMsg = isError 
        ? '<p style="text-align:center; color:#666; margin-top: 20px;">Tuyệt vời! Không có thiết bị nào gặp sự cố.</p>'
        : '<p style="text-align:center; color:#666; margin-top: 20px;">Không có thiết bị nào bình thường.</p>';
      container.innerHTML = emptyMsg;
      return;
    }

    const headerColor = isError ? '#c62828' : '#2e7d32';
    const dotColor = isError ? '#f44336' : '#4caf50';
    container.innerHTML = `<p style="font-weight: bold; margin-bottom: 12px; color: ${headerColor};">Tổng số: ${devices.length} thiết bị</p>`;

    const grouped = groupBySite(devices);

    Object.keys(grouped).forEach((siteName) => {
      const siteDevices = grouped[siteName];
      const siteGroup = document.createElement('div');
      siteGroup.className = 'site-group';
      siteGroup.style.cssText = 'border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 8px; overflow: hidden;';

      const siteHeader = document.createElement('div');
      siteHeader.className = 'site-header';
      siteHeader.dataset.site = siteName;
      siteHeader.style.cssText = `background-color: #f8f9fa; padding: 10px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 13px; color: #333; user-select: none; border-bottom: 1px solid transparent;`;
      siteHeader.innerHTML = `<span>📍 ${siteName} <span style="font-weight: normal; font-size: 12px; color: #666;">(${siteDevices.length})</span></span><span class="arrow-icon" style="transition: transform 0.2s ease; font-size: 10px; color: #777;">▼</span>`;

      const deviceListDiv = document.createElement('div');
      deviceListDiv.className = 'site-device-list';
      deviceListDiv.style.cssText = 'display: none; padding: 0 12px 6px 12px; background-color: #fff;';

      siteDevices.forEach(device => {
        deviceListDiv.innerHTML += `
          <div class="device-item" style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
            <div class="dot" style="width: 10px; height: 10px; background-color: ${dotColor}; border-radius: 50%; display: inline-block; margin-right: 8px; vertical-align: middle;"></div>
            <div style="display: inline-block; vertical-align: middle;">
              <span style="font-weight: 500; font-size: 13px;">${device.name}</span><br>
              <span style="font-size: 0.75em; color: #888;">ID: ${device.id}</span>
            </div>
          </div>`;
      });

      if (currentlyOpenSites.has(siteName)) {
        siteHeader.classList.add('is-open');
        deviceListDiv.style.display = 'block';
        siteHeader.style.backgroundColor = '#eef3f8';
        siteHeader.style.borderBottomColor = '#e0e0e0';
        const arrow = siteHeader.querySelector('.arrow-icon');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      }

      siteHeader.addEventListener('click', () => {
        const isCurrentlyOpen = deviceListDiv.style.display === 'block';
        const allHeaders = container.querySelectorAll('.site-header');
        const allLists = container.querySelectorAll('.site-device-list');
        
        allLists.forEach(list => list.style.display = 'none');
        allHeaders.forEach(hdr => {
          hdr.classList.remove('is-open');
          hdr.style.backgroundColor = '#f8f9fa';
          hdr.style.borderBottomColor = 'transparent';
          const arrow = hdr.querySelector('.arrow-icon');
          if (arrow) arrow.style.transform = 'rotate(0deg)';
        });

        if (!isCurrentlyOpen) {
          siteHeader.classList.add('is-open');
          deviceListDiv.style.display = 'block';
          siteHeader.style.backgroundColor = '#eef3f8';
          siteHeader.style.borderBottomColor = '#e0e0e0';
          const arrow = siteHeader.querySelector('.arrow-icon');
          if (arrow) arrow.style.transform = 'rotate(180deg)';
        }
      });

      siteGroup.appendChild(siteHeader);
      siteGroup.appendChild(deviceListDiv);
      container.appendChild(siteGroup);
    });
  }

  function displayData(normal, error) {
    renderGroupedList(contentNormal, normal, false);
    renderGroupedList(contentError, error, true);

    if (isFirstLoad) {
      if (error.length > 0) switchTab(false);
      else switchTab(true);
      isFirstLoad = false;
    }
  }

  scanBtn.innerText = "🟢 Đang chạy nền tự động...";
  scanBtn.style.backgroundColor = "#28a745";

  // Hiển thị ngay lập tức và tự động làm mới trên Extension
  fetchAndDisplayData();
  setInterval(fetchAndDisplayData, 3000);
});