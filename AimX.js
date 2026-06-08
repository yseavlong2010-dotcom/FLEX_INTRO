// ==========================================
// FILE 2: AimX.js (Cập nhật lên Github)
// ==========================================

const url = $request.url;
let body = $response.body;

try {
    let obj = JSON.parse(body);
    
    // Kiểm tra định dạng gói tin và ghi đè thông số
    if (url.indexOf("garena.com") !== -1) {
        // Tối ưu hóa dữ liệu trạng thái mạng
        if (obj.data) {
            obj.data.latency = 1;
            obj.data.ping = 1;
            obj.data.jitter = 0;
        }
        if (obj.network_status) {
            obj.network_status.latency = 1;
            obj.network_status.jitter = 0;
        }
        // Xóa block telemetry để giảm kích thước gói tin phản hồi
        if (obj.telemetry) {
            delete obj.telemetry;
        }
    }
    
    // Trả về dữ liệu đã được tinh chỉnh
    $done({ body: JSON.stringify(obj) });
} catch (e) {
    // Trả về gói tin gốc nếu không thể parse JSON (chống crash app)
    $done({ body: body });
}
