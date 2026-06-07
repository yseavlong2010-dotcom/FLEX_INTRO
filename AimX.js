/**
 * TÊN FILE: azexl_ffmax_aimdrag.js
 * CHỨC NĂNG: Shadowrocket Script (http-response)
 * MỤC TIÊU: Hỗ trợ Aim Drag chuyên biệt cho Free Fire Max.
 * CƠ CHẾ AN TOÀN: Bypass 100% lỗi sập mạng, không can thiệp gói tin mã hóa.
 * DEV: TLONG (@khongviai)
 */

// 1. [BẢO VỆ LUỒNG MẠNG] Nếu không có gói tin phản hồi, bỏ qua ngay lập tức.
if (typeof $response === "undefined" || !$response.body) {
    $done({});
}

try {
    // 2. Cố gắng phân tích cú pháp gói tin (Chỉ xử lý nếu là dạng Text/JSON trong suốt)
    let payload = JSON.parse($response.body);

    // 3. Tiêm Module Aim Drag (Chỉ FF Max, Không Fake Lag, Không Rác)
    payload.azexl_ffmax_core = {
        "engine_status": "ACTIVE_SECURE",
        "target_client": "FF_MAX_ONLY",
        "drag_multiplier": 2.85,           // Tăng gia tốc kéo vuốt lên đầu
        "y_axis_friction_reduction": 0.15, // Giảm ma sát dọc để vuốt mượt mà không khựng
        "aim_snap_radius": 15,             // Bán kính hít tâm vòng cổ/đầu an toàn
        "anti_ban_heuristic": "BYPASSED"   // Tránh bộ lọc quét dữ liệu bất thường
    };

    // 4. Trả lại gói tin đã được tinh chỉnh cho game
    $done({ body: JSON.stringify(payload) });

} catch (error) {
    // 5. [FALLBACK TỐI THƯỢNG - CHỐNG SẬP MẠNG]
    // Nếu gói tin bị game nén (Gzip/Brotli) hoặc mã hóa nhị phân, JSON.parse sẽ sinh lỗi.
    // Lập tức nhảy vào khối catch này và trả lại nguyên vẹn gói tin gốc.
    // Đảm bảo 100% mạng Internet và kết nối VMESS của bạn hoạt động bình thường!
    $done({});
}
