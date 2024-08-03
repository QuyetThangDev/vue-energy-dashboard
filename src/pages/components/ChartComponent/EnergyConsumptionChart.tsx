import { useQuery } from "@tanstack/react-query";

import { getLatestData } from "@/api/data";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
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
        color: "#4cc9f0",
    },
} satisfies ChartConfig;

interface DeviceDetailProps {
    deviceId: string | undefined;
    startDate: Date | string;
    endDate: Date | string;
    timeout: string;
    // timeout: number;
}

interface DataItem {
    ts: string;
    value: number;
}

const EnergyConsumptionChart = ({ deviceId, startDate, endDate, timeout }: DeviceDetailProps) => {
    // Hàm để chuyển đổi ngày sang định dạng ISO với múi giờ địa phương
    const toISODate = (date?: Date | string) => {
        if (!date) return undefined;
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString();
    };

    // Chuyển đổi startDate và endDate sang định dạng ISO
    const startDateISO = toISODate(startDate);
    const endDateISO = toISODate(endDate);

    const intervalType = timeout === "REALTIME" ? "MINUTE" : timeout;

    const { data: latestEnergyData, isLoading, error } = useQuery({
        queryKey: ['latestEnergyData', deviceId, startDateISO, endDateISO],
        queryFn: () => getLatestData({
            deviceId: deviceId!,
            start: startDateISO!,
            end: endDateISO!,
            key: 'Total kWh',
            interval: 1,
            intervalType: intervalType,
            aggType: 'MAX',
        }),
        staleTime: 60000, // Cache data for 1 minute
        enabled: !!deviceId && !!startDateISO && !!endDateISO,
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

    const calculateenergys = (data: DataItem[]) => {
        return data.map((item, index) => {
            if (index === 0) {
                return { ...item, difference: 0 }; // No previous day to compare
            }
            const previousItem = data[index - 1];
            return { ...item, difference: previousItem.value - item.value };
        });
    };

    const transformData = (data: DataItem[]) => calculateenergys(data).slice().reverse().map(item => ({
        timestamp: item.ts,
        Energy: item.difference.toFixed(2),
    }));

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

    // Legend labels are fixed here
    const customLegendFormatter = (value: string) => {
        switch (value) {
            case 'Energy':
                return 'Total kWh';
            default:
                return value;
        }
    };

    return (
        <Card className="h-[300px]">
            <CardHeader>
                <CardTitle>Energy Consumption Data</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full p-2">
                    <BarChart data={transformData(latestEnergyData?.data || [])}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="timestamp" tickFormatter={formatDate} />
                        <YAxis tickCount={5} />
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
                        <Bar dataKey="Energy" fill="var(--color-activePower)" stroke="var(--color-activePower)" type="monotone" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default EnergyConsumptionChart;