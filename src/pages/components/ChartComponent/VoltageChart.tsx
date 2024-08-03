import { useQuery } from "@tanstack/react-query";

import { getLatestData } from "@/api/data";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";
import { Spinner } from "@/components/ui/spinner";

const chartConfig = {
    phase1: {
        label: "phase1",
        color: "#f35b04",
    },
    phase2: {
        label: "phase2",
        color: "#aacc00",
    },
    phase3: {
        label: "phase3",
        color: "#4cc9f0",
    },
    current1: {
        label: "current1",
        color: "#f35b04",
    },
    current2: {
        label: "current2",
        color: "#aacc00",
    },
    current3: {
        label: "current3",
        color: "#4cc9f0",
    },
    energy: {
        label: "energy",
        color: "#f35b04",
    },
    activePower: {
        label: "activePower",
        color: "#aacc00",
    },
} satisfies ChartConfig;

interface DeviceDetailProps {
    deviceId: string | undefined;
    startDate: Date | string;
    endDate: Date | string;
    timeout: string;
}

interface DataItem {
    ts: string;
    value: number;
}

const VoltageChart = ({ deviceId, startDate, endDate, timeout }: DeviceDetailProps) => {
    // Hàm để chuyển đổi ngày sang định dạng ISO với múi giờ +07:00
    const toISODate = (date?: Date | string) => {
        if (!date) return undefined;
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const offset = 7 * 60 * 60 * 1000; // +07:00 in milliseconds
        const localDate = new Date(dateObj.getTime() + offset);
        return localDate.toISOString().replace('Z', '+07:00');
    };

    // Chuyển đổi startDate và endDate sang định dạng ISO
    const startDateISO = toISODate(startDate);
    const endDateISO = toISODate(endDate);

    // Determine the interval type
    const intervalType = timeout === "REALTIME" ? "MINUTE" : timeout;

    const { data: latestVoltageData, isLoading, error } = useQuery({
        queryKey: ['latestVoltageData', deviceId, startDateISO, endDateISO],
        queryFn: () => getLatestData({
            deviceId: deviceId!,
            start: startDateISO!,
            end: endDateISO!,
            key: 'Voltage',
            interval: 1,
            intervalType: intervalType,
            aggType: 'MAX',
        }),
        staleTime: 60000, // Cache data for 1 minute
        enabled: !!deviceId && !!startDateISO && !!endDateISO,
        refetchInterval: 6000, // Refetch data every 6 seconds
    });

    // Handle loading and error states
    if (isLoading) {
        return <div className='flex items-center justify-center h-screen'>
            <Spinner />
        </div>;
    }

    if (error) {
        return <div>Error loading data</div>;
    }

    const formatDate = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            const formatter = new Intl.DateTimeFormat('en-US', {
                // year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
            return formatter.format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return timestamp; // Return raw timestamp if formatting fails
        }
    };


    const customLegendFormatter = (value: string) => {
        switch (value) {
            case 'value':
                return 'Voltage';
            default:
                return value;
        }
    };

    const transformData = (data: DataItem[] | undefined) => {
        // Đảo chiều dữ liệu trước khi map
        return data?.slice().reverse().map(item => ({
            timestamp: formatDate(item.ts),
            Voltage: item.value,
        })) || [];
    };

    return (
        <Card className="h-[300px]">
            <CardHeader>
                <CardTitle>Voltage Data</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full p-2">
                    <LineChart data={transformData(latestVoltageData?.data)}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="timestamp" />
                        <YAxis domain={["dataMin", "dataMax"]} tickCount={5} />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={customLegendFormatter}
                                    indicator="dot"
                                />
                            }
                        />
                        <Legend formatter={customLegendFormatter} />
                        <Line dataKey="Voltage" fill="var(--color-energy)" stroke="var(--color-energy)" type="monotone" />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default VoltageChart;
