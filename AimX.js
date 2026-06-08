/**
 * TÊN FILE: AimX.js
 * PHIÊN BẢN: PRO_OVERRIDE_V1 (Real Parameter Modification)
 * CƠ CHẾ: Tìm kiếm đệ quy và can thiệp trực tiếp vào biến nội bộ của game.
 */

if (typeof $response === "undefined" || !$response.body) {
    $done({});
}

try {
    let payload = JSON.parse($response.body);

    // 1. [THUẬT TOÁN ĐỆ QUY TÌM VÀ SỬA BIẾN GỐC CỦA GAME]
    // Hàm này sẽ lục lọi mọi ngóc ngách trong file cấu hình của game tải về
    function overrideGameParameters(obj) {
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                overrideGameParameters(obj[key]); // Tiếp tục quét sâu vào trong
            } else if (typeof obj[key] === 'number') {
                let lowerKey = key.toLowerCase();
                
                // --- AIMLOCK & AIM DRAG (Hút tâm & Kéo tâm) ---
                // Tăng thông số hỗ trợ ngắm và lực hút từ tính
                if (lowerKey.includes('aim') || lowerKey.includes('assist') || lowerKey.includes('magnet')) {
                    obj[key] = obj[key] * 2.5; // Tăng 250% độ dính tâm
                }
                // Giảm ma sát vuốt trục Y để vuốt kéo đầu mượt hơn
                if (lowerKey.includes('friction') && lowerKey.includes('y')) {
                    obj[key] = obj[key] * 0.15; // Giảm 85% lực cản
                }

                // --- NO RECOIL & STRAIGHT BULLET (Đạn thẳng & Giảm giật) ---
                if (lowerKey.includes('recoil') || lowerKey.includes('kick')) {
                    obj[key] = obj[key] * 0.05; // Triệt tiêu 95% độ giật súng
                }
                if (lowerKey.includes('spread') || lowerKey.includes('scatter')) {
                    obj[key] = obj[key] * 0.05; // Đạn không bị tản mát
                }

                // --- HITBOX EXPANSION (Tăng kích thước đầu) ---
                if (lowerKey.includes('head') && lowerKey.includes('scale')) {
                    obj[key] = obj[key] * 1.45; // Tăng kích thước nhận diện đầu lên 45%
                }
                if (lowerKey.includes('neck') && lowerKey.includes('multiplier')) {
                    obj[key] = obj[key] * 2.0; // Hút từ cổ x2
                }
            } else if (typeof obj[key] === 'string') {
                // Đổi ưu tiên bắt tâm từ Ngực (Chest) sang Cổ/Đầu (Neck/Head)
                if (obj[key] === 'Chest' || obj[key] === 'Spine') {
                    obj[key] = 'Head';
                }
            }
        }
    }

    // Thực thi thuật toán quét và sửa đổi
    overrideGameParameters(payload);

    // 2. [CẮT ĐUÔI BÁO CÁO ANTI-BAN]
    if (payload.report_url) payload.report_url = "https://127.0.0.1";
    if (payload.enable_log) payload.enable_log = false;

    // 3. ĐÓNG GÓI TRẢ VỀ GAME
    $done({ body: JSON.stringify(payload) });

} catch (error) {
    // Bảo vệ không sập mạng nếu gói tin bị mã hóa
    $done({});
}
