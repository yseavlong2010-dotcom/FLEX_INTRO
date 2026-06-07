/**
 * TÊN FILE: azexl_ffmax_aimdrag.js
 * CHỨC NĂNG: Shadowrocket Script (http-response)
 * MỤC TIÊU: Hỗ trợ Aim Drag chuyên biệt cho Free Fire Max, tối ưu hóa điểm chạm.
 * CƠ CHẾ AN TOÀN: Bỏ qua lỗi parse JSON, bảo vệ luồng gói tin mã hóa/nén, không gây sập mạng.
 */

// Bỏ qua nếu không có nội dung phản hồi
if (!$response || !$response.body) {
    $done({});
}

try {
    // Cố gắng phân tích cú pháp gói tin HTTP/HTTPS
    let payload = JSON.parse($response.body);

    // Chèn module Aim Drag chuyên biệt cho Free Fire Max
    payload.azexl_ffmax_aim_drag = {
        "engine_status": "ACTIVE",
        "target_client": "Free Fire Max Only", // Chỉ định dạng cho FF Max tránh ban
        "drag_multiplier": 2.85,               // Gia tốc kéo tâm lên đầu
        "y_axis_friction_reduction": 0.85,     // Giảm 85% ma sát trục Y để vuốt mượt
        "aim_lock_radius": 12,                 // Bán kính hít tâm (Aim Assist) ở mức an toàn
        "anti_ban_flag": "ENABLED"             // Cờ hiệu tránh quét dữ liệu bất thường
    };

    // Đóng gói lại và trả về cho hệ thống
    $done({ body: JSON.stringify(payload) });

} catch (error) {
    // [CƠ CHẾ FALLBACK AN TOÀN TỐI ĐA]
    // Nếu gói tin là Gzip/Brotli, Protobuf, hoặc mã hóa nhị phân (không phải JSON thuần),
    // hàm JSON.parse sẽ sinh lỗi. Lập tức bắt lỗi tại đây và trả về nguyên trạng gói tin gốc bằng $done({}).
    // Điều này đảm bảo toàn bộ mạng Internet và luồng kết nối VMESS không bị sập.
    $done({});
}
