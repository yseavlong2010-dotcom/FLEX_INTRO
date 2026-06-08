// ==========================================
// FILE 2: AimX.js (Data Manipulation Module)
// Nhiệm vụ: Tái cấu trúc gói tin (Response Injection). Giả lập trạng thái đồng bộ hoàn hảo để tạo lợi thế "Aimlock" ảo (Hitbox Desync).
// ==========================================
const url = $request.url;
let body = $response.body;

try {
    let obj = JSON.parse(body);

    if (url.includes("garena.com")) {
        // [MODULE A: NETWORK DESYNC]
        // Đánh lừa server tin rằng client không có độ trễ, buộc server ghi nhận hit marker sớm hơn.
        if (obj.data) {
            obj.data.latency = 0;
            obj.data.ping = 0;
            obj.data.jitter = 0;
            obj.data.packet_loss = 0; 
        }
        if (obj.network_status) {
            obj.network_status.latency = 0;
            obj.network_status.jitter = 0;
        }
        
        // [MODULE B: ANTI-BAN CACHE FLUSH]
        // Xóa hoàn toàn các báo cáo lỗi bộ nhớ gửi về máy chủ.
        if (obj.telemetry) delete obj.telemetry;
        if (obj.report) delete obj.report;
        if (obj.crash_log) delete obj.crash_log;

        // [MODULE C: HITBOX/AIM ASSIST (GIẢ LẬP)]
        // Tác động vào gói cấu hình trò chơi gửi từ máy chủ về máy khách (nếu có).
        // Thay đổi tham số "độ sai lệch vũ khí" và "hỗ trợ ngắm".
        // Lưu ý: Các tham số này phụ thuộc vào cấu trúc API thực tế của Garena.
        if (obj.game_config) {
             if (obj.game_config.aim_assist !== undefined) obj.game_config.aim_assist = 1.5; // Tăng cường độ hút tâm
             if (obj.game_config.recoil_multiplier !== undefined) obj.game_config.recoil_multiplier = 0.5; // Giảm độ giật mô phỏng
             if (obj.game_config.spread_multiplier !== undefined) obj.game_config.spread_multiplier = 0.5; // Tăng độ gom đạn
        }
    }

    $done({ body: JSON.stringify(obj) });
} catch (e) {
    $done({ body: body }); 
}
