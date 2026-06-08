/**
 * TÊN FILE: AimX.js
 * PHIÊN BẢN: PRO_MAX_SAFE (Chống Crash & Bẫy Lỗi Đa Tầng)
 * CƠ CHẾ: Quét đệ quy an toàn, tự động bỏ qua nếu dữ liệu bị mã hóa.
 */

// 1. Kiểm tra gói tin hợp lệ
if (typeof $response === "undefined" || !$response.body) {
    $done({});
}

try {
    // 2. Bẫy lỗi parse JSON (Nếu Garena mã hóa luồng, chỗ này sẽ báo lỗi nhưng không làm sập mạng)
    let bodyString = $response.body;
    let payload = JSON.parse(bodyString);

    // 3. Thuật toán quét và ghi đè an toàn (Chỉ can thiệp số liệu, không phá vỡ cấu trúc)
    function safeInject(obj) {
        if (!obj || typeof obj !== 'object') return;
        
        for (let key in obj) {
            if (typeof obj[key] === 'object') {
                safeInject(obj[key]); // Quét sâu vào trong
            } else if (typeof obj[key] === 'number') {
                let k = key.toLowerCase();
                
                // [TỐI ƯU HÓA AIM]
                if (k.includes('aim') || k.includes('assist') || k.includes('magnet')) {
                    obj[key] = obj[key] * 3.5; 
                }
                if (k.includes('friction') && k.includes('y')) {
                    obj[key] = obj[key] * 0.10; 
                }
                
                // [TỐI ƯU HÓA ĐẠN & GIẬT]
                if (k.includes('recoil') || k.includes('kick')) {
                    obj[key] = obj[key] * 0.01; 
                }
                if (k.includes('spread') || k.includes('scatter')) {
                    obj[key] = obj[key] * 0.05; 
                }
                
                // [MỞ RỘNG HITBOX]
                if (k.includes('head') && k.includes('scale')) {
                    obj[key] = obj[key] * 1.50; 
                }
            }
        }
    }

    // Thực thi
    safeInject(payload);

    // 4. Cắt đuôi máy chủ Anti-Ban & Telemetry
    if (payload.report_url) payload.report_url = "https://127.0.0.1";
    if (payload.telemetry_url) payload.telemetry_url = "https://127.0.0.1";
    if (payload.enable_log !== undefined) payload.enable_log = false;

    // 5. Trả dữ liệu về cho game
    $done({ body: JSON.stringify(payload) });

} catch (error) {
    // [QUAN TRỌNG NHẤT] Nếu có bất kỳ lỗi gì (game update đổi cấu trúc, mã hóa gói tin...), 
    // lập tức trả về gói tin gốc để game vẫn chơi bình thường, KHÔNG LÀM CRASH SHADOWROCKET.
    console.log("Azexl Script Bypass: Dữ liệu không phải JSON thuần, đã trả về bản gốc.");
    $done({ body: $response.body });
}
