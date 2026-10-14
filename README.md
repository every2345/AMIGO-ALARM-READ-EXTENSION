# AMIGO-ALARM-READ-EXTENSION
1. manifest.json (File cấu hình cốt lõi)
    •	Chức năng: Khai báo cấu hình tổng thể và thiết lập quyền hoạt động cho Extension (theo chuẩn Manifest V3). 
    •	Chi tiết bên trong:
    o	Cấp quyền thực thi mã (scripting) và cho phép giao tiếp với Localhost (http://localhost:5000/*) cũng như mọi trang web (<all_urls>). 
    o	Chỉ định file background.js làm tiến trình chạy ngầm trung tâm. 
    o	Cấu hình tự động tiêm content.js vào mọi ngóc ngách của trang web và toàn bộ các khung iframe (all_frames: true). 
    o	Khai báo giao diện chính khi bấm vào icon Extension là popup.html. 
2. background.js (Tiến trình ngầm / Bộ não trung tâm)
    •	Chức năng: Quản lý dữ liệu tập trung và đóng vai trò cầu nối gửi dữ liệu sang ứng dụng Python. 
    •	Chi tiết bên trong:
    o	Lắng nghe các gói tin báo cáo (report_data) được gửi lên từ các content.js ở các khung iframe và lưu trữ tạm thời. 
    o	Chạy hàm aggregateData() để tổng hợp toàn bộ thiết bị, đồng thời loại bỏ dữ liệu rác từ các khung đã đóng quá 10 giây. 
    o	Cứ mỗi 3 giây, tự động dùng lệnh fetch để đẩy gói JSON chứa trạng thái thiết bị sang Flask server của phần mềm Python (http://localhost:5000/update). 
    o	Trả dữ liệu tổng hợp về cho popup.js khi người dùng bấm mở giao diện Extension. 
3. content.js (Đoạn mã "nội gián" chạy trên trang web)
    •	Chức năng: Trích xuất và cào dữ liệu trực tiếp từ mã nguồn HTML của trang web Globiots. 
    •	Chi tiết bên trong:
    o	Chứa hàm scrapeDeviceData() để tìm kiếm các thẻ chứa thiết bị (.site-sensor), bóc tách tên thiết bị (_serialNumber), mã ID, tên khu vực (site) và trạng thái cảm biến (bình thường hay alarm sự cố). 
    o	Cứ mỗi 2.5 giây, nó tự động quét và chủ động gửi báo cáo kết quả thu được về cho background.js. 
4. popup.html (Khung giao diện người dùng)
    •	Chức năng: Định dạng bố cục, cấu trúc HTML hiển thị khi bạn click vào biểu tượng của Extension trên thanh công cụ trình duyệt. 
    •	Chi tiết bên trong:
    o	Thiết kế khung popup rộng 350px. 
    o	Tạo các nút chuyển tab qua lại giữa danh sách "Bình thường (Xanh)" và "Sự cố (Đỏ)". 
    o	Định nghĩa sẵn các vùng chứa nội dung danh sách cuộn được và các quy tắc CSS cơ bản để làm đẹp giao diện. 
5. popup.js (Bộ điều khiển giao diện Extension)
    •	Chức năng: Xử lý logic hiển thị trực quan ngay trên cửa sổ popup khi người dùng mở lên xem. 
    •	Chi tiết bên trong:
    o	Gửi thông điệp yêu cầu lấy dữ liệu mới nhất (get_latest_data) từ background.js. 
    o	Gom nhóm các thiết bị theo khu vực (groupBySite) và vẽ giao diện danh sách dạng cây thu gọn mở rộng (accordion). 
    o	Tự động chuyển hướng sang tab Sự cố nếu phát hiện thiết bị lỗi trong lần tải đầu tiên, đồng thời duy trì việc cập nhật giao diện mỗi 3 giây khi cửa sổ popup đang mở. 
6. icon.png (Biểu tượng Extension)
•	Chức năng: Cung cấp hình ảnh logo/biểu tượng trực quan nhận diện cho Extension nằm trên thanh công cụ của trình duyệt. 

