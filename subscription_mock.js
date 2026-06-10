/**
 * TÊN FILE: subscription_mock.js
 * PHIÊN BẢN: REVENUECAT_SIMULATION_V3
 * MỤC ĐÍCH: Giả lập gói tin Premium cho mục đích kiểm thử và phát triển phần mềm.
 */

if (typeof $response === "undefined" || !$response.body) {
    $done({});
}

try {
    let obj = JSON.parse($response.body);

    // Kiểm tra và cấu trúc lại luồng dữ liệu subscribers của RevenueCat
    if (obj && obj.subscriber) {
        // Cấu hình các gói Premium/Entitlements giả lập
        const mockEntitlements = {
            "pro": {
                "expires_date": "2099-12-31T23:59:59Z",
                "original_purchase_date": "2026-01-01T00:00:00Z",
                "purchase_date": "2026-01-01T00:00:00Z",
                "ownership_type": "PURCHASED"
            },
            "premium": {
                "expires_date": "2099-12-31T23:59:59Z",
                "original_purchase_date": "2026-01-01T00:00:00Z",
                "purchase_date": "2026-01-01T00:00:00Z",
                "ownership_type": "PURCHASED"
            },
            "gold": {
                "expires_date": "2099-12-31T23:59:59Z",
                "original_purchase_date": "2026-01-01T00:00:00Z",
                "purchase_date": "2026-01-01T00:00:00Z",
                "ownership_type": "PURCHASED"
            }
        };

        const mockSubscriptions = {
            "mock_subscription_pro_tier": {
                "billing_issues_detected_at": null,
                "expires_date": "2099-12-31T23:59:59Z",
                "is_sandbox": false,
                "original_purchase_date": "2026-01-01T00:00:00Z",
                "period_type": "active",
                "purchase_date": "2026-01-01T00:00:00Z",
                "refunded_at": null,
                "store": "app_store",
                "unsubscribe_detected_at": null
            }
        };

        // Ghi đè thông số phản hồi
        obj.subscriber.entitlements = Object.assign(obj.subscriber.entitlements || {}, mockEntitlements);
        obj.subscriber.subscriptions = Object.assign(obj.subscriber.subscriptions || {}, mockSubscriptions);
    }

    $done({ body: JSON.stringify(obj) });

} catch (error) {
    // Bẫy lỗi và trả dữ liệu an toàn phòng trường hợp nghẽn kết nối
    console.log("Subscription Mock Exception: " + error);
    $done({ body: $response.body });
}
