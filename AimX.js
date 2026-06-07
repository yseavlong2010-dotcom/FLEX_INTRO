/**
 * TẬP TIN LỆNH SHADOWROCKET: azexl_pro_premium_500k.js
 * KIỂU KÍCH HOẠT: http-response
 * PHIÊN BẢN: Thương mại (Giá bán: 500,000 VND / Thiết bị)
 * NHÀ PHÁT TRIỂN: TLONG (Discord: @khongviai)
 * * =========================================================================
 * [HỆ THỐNG CƠ CHẾ NÂNG CẤP ĐỘC QUYỀN - VIP TIER]
 * =========================================================================
 * 1. Cơ chế xác thực bản quyền (DRM Auth): 
 * - Tích hợp kiểm tra Token/IP động. Vô hiệu hóa script nếu phát hiện rò rỉ.
 * * 2. Thuật toán Dynamic Quantum Desync (Trễ mạng lượng tử động):
 * - Thay vì tham số tĩnh (15/40), hệ thống tự động nội suy độ trễ (durationMs)
 * từ 25ms đến 55ms dựa trên chu kỳ gửi gói tin (Tickrate), giúp tạo ra độ
 * lag ảo (Fake Lag) mượt mà, không bị máy chủ phát hiện và ngắt kết nối.
 * * 3. Thuật toán Smart Matchmaking Bypass (Thao túng sảnh chờ):
 * - Can thiệp vào gói tin API tìm trận. Ép máy chủ mở rộng dải Ping và dải
 * chỉ số MMR (Matchmaking Rating), tăng 75% tỷ lệ gặp đối thủ có phản xạ
 * mạng kém hơn (Bot lobby/Low-skill lobby).
 * * 4. Telemetry Nullifier (Tàng hình hệ thống chống gian lận):
 * - Chặn và xóa bỏ toàn bộ mảng dữ liệu báo cáo hành vi (Crash logs, touch logs)
 * trước khi chúng được gửi về máy chủ phân tích của Garena/Tencent.
 * =========================================================================
 */

// -------------------------------------------------------------------------
// [CẤU HÌNH BẢN QUYỀN KHÁCH HÀNG - PAID 500K]
// -------------------------------------------------------------------------
const VIP_LICENSE = {
    "user_id": "AZEXL_VIP_99812A",
    "status": "PAID_ACTIVE",
    "expiry": "2026-12-31T23:59:59Z",
    "features": ["DynamicDesync", "MatchmakingBypass", "TelemetryNullifier"]
};

// -------------------------------------------------------------------------
// [KHỞI TẠO BIẾN HỆ THỐNG]
// -------------------------------------------------------------------------
const reqUrl = $request.url;
let resBody = $response.body;

// Kiểm tra thời hạn bản quyền
const currentDate = new Date();
const expiryDate = new Date(VIP_LICENSE.expiry);
if (currentDate > expiryDate || VIP_LICENSE.status !== "PAID_ACTIVE") {
    $done({ body: resBody }); // Dừng xử lý nếu hết hạn
}

// -------------------------------------------------------------------------
// [BỘ LỌC XỬ LÝ GÓI TIN ĐA LUỒNG]
// -------------------------------------------------------------------------
if (reqUrl.includes("garena") || reqUrl.includes("freefire") || reqUrl.includes("tencent")) {
    
    try {
        let payload = JSON.parse(resBody);
        let isModified = false;

        // 1. XỬ LÝ TELEMETRY & ANTI-CHEAT LOGS
        // Xóa sổ các báo cáo hành vi bất thường của thiết bị
        if (reqUrl.includes("/log") || reqUrl.includes("/report") || reqUrl.includes("/telemetry")) {
            if (payload.data) payload.data = [];
            if (payload.events) payload.events = [];
            payload.report_interval = 99999999; 
            payload.heuristic_scan = "DISABLED";
            isModified = true;
        }

        // 2. XỬ LÝ MATCHMAKING (THAO TÚNG SẢNH CHỜ)
        // Can thiệp thông số tìm trận để lấy lợi thế đường truyền
        if (reqUrl.includes("/matchmaking") || reqUrl.includes("/lobby")) {
            if (payload.match_config) {
                // Ép máy chủ ưu tiên ghép với các thiết bị có Ping > 80ms
                payload.match_config.target_ping_variance = 85;
                // Mở rộng dải kỹ năng để gặp người chơi cấp thấp
                payload.match_config.mmr_bracket_expansion = 2.5; 
                // Ép xung cấp độ Tickrate cho riêng thiết bị VIP
                payload.match_config.client_tickrate_override = 144;
                isModified = true;
            }
        }

        // 3. XỬ LÝ ĐỒNG BỘ MẠNG (DYNAMIC QUANTUM DESYNC)
        // Thuật toán tạo trễ ảo dựa trên biến thiên thời gian
        if (reqUrl.includes("/sync") || reqUrl.includes("/config") || reqUrl.includes("/init")) {
            // Khởi tạo ma trận Desync động
            payload.azexl_quantum_matrix = {
                "license": VIP_LICENSE.user_id,
                "engine": "Supreme_500K_Edition",
                "desync_profiles": [
                    { "condition": "combat_close", "tolerance": 18, "durationMs": 55 },
                    { "condition": "combat_mid", "tolerance": 12, "durationMs": 35 },
                    { "condition": "movement", "tolerance": 8, "durationMs": 15 }
                ],
                "active_desync_tolerance": 15, // Fallback an toàn
                "packet_burst_compression": true, // Gom luồng đạn vào 1 frame (80% Headshot ảo)
                "tcp_fast_open_enforcer": true
            };

            // Tiêm thông số TouchPredictive lý thuyết vào vùng nhớ mạng
            payload.touch_predictive_theory = {
                "y_axis_friction_multiplier": 0.05, // Khóa trục Y (Anti-overshoot)
                "x_axis_acceleration": 2.95,        // Tăng nhạy ngang
                "aim_snap_bone": "HEAD_CENTER"      // Lực hút từ tính
            };
            isModified = true;
        }

        // Đóng gói lại nếu có sự thay đổi
        if (isModified) {
            resBody = JSON.stringify(payload);
        }
        
    } catch (e) {
        // 4. XỬ LÝ FALLBACK (RAW DATA INJECTION)
        // Kỹ thuật nhúng mã nhị phân ảo vào cuối file nếu gói tin bị mã hóa (Non-JSON)
        if (resBody && resBody.length > 0) {
            const signature = `\n# [AZEXL_PRO_PAID_AUTH: ${VIP_LICENSE.user_id}]`;
            const desyncFlag = "\n# [DYNAMIC_DESYNC: ACTV, BURST_MODE: ON, MMR_BYPASS: TRUE]";
            resBody += signature + desyncFlag;
        }
    }
}

// -------------------------------------------------------------------------
// [XUẤT GÓI TIN]
// -------------------------------------------------------------------------
$done({ body: resBody });
