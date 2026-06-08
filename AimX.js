/**
 * TÊN FILE: AimX.js
 * PHIÊN BẢN: VIP SUPREME (Fix SSL Pinning + Magic Bullet)
 * DEV: TLONG (@khongviai)
 */

if (typeof $response === "undefined" || !$response.body) {
    $done({});
}

try {
    let payload = JSON.parse($response.body);

    if (typeof payload !== 'object' || payload === null) {
        $done({});
    }

    // --- HỆ THỐNG AZEXL SUPREME ENGINE ---
    payload.azexl_supreme_engine = {
        "engine_state": "ACTIVE_STEALTH_V2",
        "bypass_signature": "SSL_PINNING_BYPASSED",

        // 1. AIM DRAG & HITBOX (Ghim cổ nảy đầu)
        "hitbox_modifier": {
            "head_scale_factor": 1.60,         // Mở rộng hitbox đầu lên 60%
            "neck_magnet_multiplier": 2.5,     // Lực hút từ cổ lên đầu cực mạnh
            "bone_priority": ["Neck", "Head"],
            "bullet_magnetism_ratio": 1.25     // Đạn tự động bẻ cong 25% vào hitbox
        },
        
        "drag_overclock": {
            "y_axis_acceleration": 3.15,       // Gia tốc vuốt trục Y siêu nhạy (Dễ lên đầu)
            "frictionless_drag": true,
            "dynamic_braking": { "enabled": true, "brake_force_ratio": 0.90 } // Dừng tâm ngay tại đầu
        },

        // 2. MAGIC BULLET & RECOIL (Đạn ma thuật & Chống giật)
        "weapon_ballistics": {
            "magic_bullet_radius": 0.5,        // Bán kính đạn ma thuật ảo (viên đạn to hơn)
            "recoil_reduction_pct": 95,        // Giảm 95% độ giật lên
            "spread_reduction_pct": 95,        // Đạn gom thành 1 điểm
            "fire_rate_delay_ms": -15          // Giảm độ trễ khai hỏa đi 15ms (Bắn nhanh hơn địch)
        },

        // 3. MAX RANGE AIM ASSIST (Tầm nhìn & Bám mục tiêu)
        "aim_assist_extension": {
            "red_dot_max_distance": 300,       // Kéo xa tầm bắt tâm đỏ
            "auto_track_through_walls": false, // Tắt để an toàn chống ban
            "target_stickiness": 1.5           // Độ dính của tâm vào mục tiêu x1.5
        }
    };

    // XÓA DẤU VẾT THEO DÕI
    if (payload.telemetry) payload.telemetry = { "enabled": false };
    if (payload.crash_report) payload.crash_report = { "enabled": false };
    if (payload.anticheat_log) payload.anticheat_log = { "send_interval": 999999 };

    $done({ body: JSON.stringify(payload) });

} catch (error) {
    // Chống sập mạng tuyệt đối
    $done({});
}
