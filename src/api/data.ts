import http from '@/utils/http'
export function getLatestData(params: {
    deviceId: string;
    start: string;
    end: string;
    key: string;
    interval: number;
    intervalType: string;
    aggType: string;
}) {
    const q = {
        device_id: params.deviceId,
        start: params.start,
        end: params.end,
        key: params.key,
        interval_type: params.intervalType,
        interval: params.interval,
        agg_type: params.aggType,
        limit: 100,
    };
    return http.get("/telemetry/metrics/values", { params: q });
}