import http from '@/utils/http'
export function getDeviceAttributes(params: {
    deviceId: string;
    keys: string[];
}) {
    const q = {
        device_id: params.deviceId,
        keys: params.keys.join(","),
    };

    return http.get("/telemetry/attributes/values", {
        params: q,
    });
}