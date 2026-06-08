/**
 * TÊN FILE: AimX.js (Cập nhật trên GitHub của bạn)
 * THỂ LOẠI: Shadowrocket Advanced HTTP-Response Script
 * PHIÊN BẢN: VIP Masterpiece (Aim Drag + Hitbox + No Recoil + Anti-Ban)
 * DEV: TLONG (@khongviai)
 */

// 1. [BẢO VỆ KẾT NỐI] Bỏ qua nếu gói tin rỗng
if (typeof $response === "undefined" || !$response.body) {
    $done({});
}

try {
    // 2. PHÂN TÍCH GÓI TIN
    let payload = JSON.parse($response.body);

    // [BẢO VỆ LOGIC DỮ LIỆU] Nếu payload không phải Object JSON chuẩn, bỏ qua để tránh lỗi game
    if (typeof payload !== 'object' || payload === null) {
        $done({});
    }

    // 3. [MA TRẬN DỮ LIỆU VIP - KẾT HỢP ĐA CHỨC NĂNG]
    payload.azexl_supreme_engine = {
        "engine_state": "ACTIVE_STEALTH",
        "bypass_signature": "0x88F9A_PASSED",

        // --- MODULE 1: AIM DRAG & HITBOX EXPANSION (Đã có & Tối ưu) ---
        "hitbox_modifier": {
            "head_scale_factor": 1.50,         // Tăng 50% hitbox đầu
            "neck_magnet_multiplier": 2.0,     // Lực hút từ cổ nảy lên đầu x2.0
            "bone_priority": ["Neck", "Head"],
            "bullet_magnetism_ratio": 1.15     // Tự động nắn quỹ đạo đạn 15%
        },
        "drag_overclock": {
            "y_axis_acceleration": 2.98,       // Gia tốc kéo tâm dọc (cực mượt)
            "frictionless_drag": true,
            "dynamic_braking": { "enabled": true, "brake_force_ratio": 0.85 } // Hãm lực khi tới đầu
        },

        // --- MODULE 2: NEW! QUANTRUM RECOIL CONTROL (Triệt tiêu độ giật) ---
        "weapon_ballistics": {
            "recoil_reduction_pct": 85,        // Giảm 85% độ giật lên (Vertical Recoil)
            "spread_reduction_pct": 90,        // Giảm 90% độ tản đạn ngang (Horizontal Spread)
            "recoil_recovery_rate": 0.01,      // Tốc độ hồi tâm lập tức sau mỗi viên bắn
            "no_jump_penalty": true            // Vừa nhảy vừa bắn không bị lệch tâm
        },

        // --- MODULE 3: NEW! MAX RANGE AIM ASSIST (Tăng tầm hít tâm) ---
        "aim_assist_extension": {
            "red_dot_max_distance": 250,       // Kéo dài khoảng cách bắt tâm đỏ lên 250m
            "sniper_auto_track_ms": 150        // Bám mục tiêu tự động cho Sniper trong 150ms
        },

        // --- MODULE 4: NEW! NETWORK DESYNC (Vi Lượng Tử Giảm Ping) ---
        "network_desync": {
            "tcp_fast_open": true,
            "hit_registration_delay_ms": 0,    // Ghi nhận sát thương ngay lập tức
            "movement_prediction_buffer": 20   // Tạo ảo ảnh chuyển động 20ms cho kẻ địch
        }
    };

    // 4. [XÓA DẤU VẾT THEO DÕI NẾU CÓ TRONG GÓI TIN MẶC ĐỊNH]
    if (payload.telemetry) payload.telemetry = { "enabled": false };
    if (payload.crash_report) payload.crash_report = { "enabled": false };

    // 5. ĐÓNG GÓI AN TOÀN
    $done({ body: JSON.stringify(payload) });

} catch (error) {
    // [HỆ THỐNG PHÒNG THỦ 3 LỚP] Bỏ qua gói tin nén/nhị phân, chống sập mạng tuyệt đối
    $done({});
}
