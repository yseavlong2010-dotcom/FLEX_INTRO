/**
 * TÊN FILE: AimX.js
 * PHIÊN BẢN: AZEXL_MASTER_V2 (Network Recursive Injection)
 * DEV: TLONG
 */

if (typeof $response === "undefined" || !$response.body) {
    $done({});
}

try {
    let payload = JSON.parse($response.body);

    // Thuật toán quét sâu vào từng ngóc ngách của dữ liệu game
    function injectAzexlCore(obj) {
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                injectAzexlCore(obj[key]);
            } else if (typeof obj[key] === 'number') {
                let lowerKey = key.toLowerCase();
                
                // --- AIMLOCK & AIM ASSIST (Tăng độ dính tâm) ---
                if (lowerKey.includes('aim') || lowerKey.includes('assist') || lowerKey.includes('magnet')) {
                    obj[key] = obj[key] * 3.5; // Tăng 350% lực hít tâm
                }
                // --- VUỐT MƯỢT (Giảm ma sát trục Y) ---
                if (lowerKey.includes('friction') && lowerKey.includes('y')) {
                    obj[key] = obj[key] * 0.10; // Giảm 90% lực cản khi vuốt lên
                }
                // --- ĐẠN THẲNG & NO RECOIL ---
                if (lowerKey.includes('recoil') || lowerKey.includes('kick')) {
                    obj[key] = obj[key] * 0.02; // Triệt tiêu 98% độ giật
                }
                if (lowerKey.includes('spread') || lowerKey.includes('scatter')) {
                    obj[key] = obj[key] * 0.05; // Gom đạn cực chuẩn
                }
                // --- MỞ RỘNG HITBOX ĐẦU ---
                if (lowerKey.includes('head') && lowerKey.includes('scale')) {
                    obj[key] = obj[key] * 1.65; // Tăng 65% diện tích nhận diện đầu
                }
            }
        }
    }

    injectAzexlCore(payload);

    // Chặn báo cáo log (Anti-ban cơ bản)
    if (payload.report_url) payload.report_url = "https://127.0.0.1";
    if (payload.enable_log) payload.enable_log = false;

    $done({ body: JSON.stringify(payload) });

} catch (error) {
    // Luôn trả về gói tin gốc nếu không thể can thiệp (Bảo vệ mạng)
    $done({});
}
