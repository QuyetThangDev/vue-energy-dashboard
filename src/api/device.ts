import http from '@/utils/http'

export function getDevices(params: {
    tags?: string[];
    page: number;
    pageSize: number;
}) {
    const q = {
        tags: params.tags?.join(","),
        page: params.page,
        page_size: params.pageSize,
    };
    return http.get("/devices", { params: q });
}

export function getDeviceById(id: string) {
    return http.get(`/devices/${id}`);
}

