import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { MapPin, MoreVertical } from "lucide-react";
import { getLatestData } from "@/api/data";
import { getDeviceAttributes } from "@/api/telemetry";
import { Input } from "./CustomInput";

interface Item {
    id: string;
    name: string;
    type: string;
    location: string;
    tags: string[];
}

interface DeviceCardProps {
    item: Item;
    timeout: number;
}

interface DataItem {
    ts: string;
    value: number;
}

const DeviceCard = ({ item, timeout }: DeviceCardProps) => {

    // Get the first day of the current month
    const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endDate = new Date().toISOString();

    //Voltage
    const { data: latestVoltageData } = useQuery({
        queryKey: ['latestVoltageData', item.id],
        queryFn: () => getLatestData({
            deviceId: item.id,
            start: startDate,
            end: endDate,
            key: 'Voltage',
            interval: 1,
            intervalType: 'MINUTE',
            aggType: 'MAX',
        }),
        refetchInterval: timeout,
        staleTime: 60000, // Cache data for 1 minute
    });

    //Current
    const { data: latestCurrentData } = useQuery({
        queryKey: ['latestCurrentData', item.id],
        queryFn: () => getLatestData({
            deviceId: item.id,
            start: startDate,
            end: endDate,
            key: 'Current',
            interval: 1,
            intervalType: 'MINUTE',
            aggType: 'MAX',
        }),
        staleTime: 60000, // Cache data for 1 minute
        refetchInterval: timeout,
    });

    //Power
    const { data: latestPowerData } = useQuery({
        queryKey: ['latestPowerData', item.id],
        queryFn: () => getLatestData({
            deviceId: item.id,
            start: startDate,
            end: endDate,
            key: 'Power',
            interval: 1,
            intervalType: 'MINUTE',
            aggType: 'MAX',
        }),
        staleTime: 60000, // Cache data for 1 minute
        refetchInterval: timeout,
    });

    //Energy Consumption
    const { data: latestEnergyData } = useQuery({
        queryKey: ['latestEnergyData', item.id],
        queryFn: () => getLatestData({
            deviceId: item.id,
            start: startDate,
            end: endDate,
            key: 'Total kWh',
            interval: 1,
            intervalType: 'DAY',
            aggType: 'MAX',
        }),
        staleTime: 60000, // Cache data for 1 minute
        refetchInterval: timeout,
    });

    const calculateSimpleConsumption = (data: DataItem[]) => {
        if (data.length === 0) return 0;
        const firstValue = data[0].value;
        const lastValue = data[data.length - 1].value;
        return firstValue - lastValue;
    };

    // Location
    const { data: location } = useQuery({
        queryKey: ['location'],
        queryFn: () => getDeviceAttributes({
            deviceId: item.id,
            keys: ['location'],
        }),
    });

    return (
        <Card className="w-[270px]">
            <CardHeader>
                <CardTitle>
                    <NavLink to={`/detail/${item.id}`} className="w-full mb-1 font-bold text-md">
                        <Label htmlFor={item.id}>
                            {item.name}
                        </Label>
                    </NavLink>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="outline" className="w-7 h-7">
                                <MoreVertical className="h-3.5 w-3.5" />
                                <span className="sr-only">More</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <NavLink to={`/detail/${item.id}`} className="w-full text-xs">Detail</NavLink>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <p className="w-full text-xs">Not Implemented</p>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardTitle>
                <CardDescription className='flex flex-row items-center gap-1 text-xs text-gray-400'>
                    <MapPin size={12} />
                    {location?.data && location.data[0].value || 'Unknown'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col justify-center gap-2'>
                    <p className='p-1 text-xs font-bold text-center text-white rounded-sm sm:w-full bg-primary'>VOLTAGE</p>
                    {latestVoltageData?.data && latestVoltageData.data ?
                        (<div className='flex flex-row items-center justify-between'>
                            <Label className='text-xs sm:w-1/3'>Voltage 1</Label>
                            <Input disabled value={`${latestVoltageData.data[0].value.toFixed(2)} V`} />
                        </div>
                        ) : (
                            <div className='flex flex-row items-center justify-between'>
                                <Label className='text-xs sm:w-1/3'>Voltage 1</Label>
                                <Input disabled value={'-'} />
                            </div>
                        )}
                    <p className='p-1 text-xs font-bold text-center text-white rounded-sm sm:w-full bg-primary'>CURRENT</p>
                    {latestCurrentData?.data && latestCurrentData.data ?
                        (<div className='flex flex-row items-center justify-between'>
                            <Label className='text-xs sm:w-1/3'>Current 1</Label>
                            <Input disabled value={`${latestCurrentData.data[0].value.toFixed(2)} A`} />
                        </div>
                        ) : (
                            <div className='flex flex-row items-center justify-between'>
                                <Label className='text-xs sm:w-1/3'>Current 1</Label>
                                <Input disabled value={'-'} />
                            </div>
                        )}
                    <p className='p-1 text-xs font-bold text-center text-white rounded-sm sm:w-full bg-primary'>ACTIVE POWER</p>
                    {latestPowerData?.data && latestPowerData.data ?
                        (<div className='flex flex-row items-center justify-between'>
                            <Label className='text-xs sm:w-1/2'>Active Power</Label>
                            <Input disabled value={`${latestPowerData.data[0].value.toFixed(2)} kW`} />
                        </div>
                        ) : (
                            <div className='flex flex-row items-center justify-between'>
                                <Label className='text-xs sm:w-1/2'>Active Power</Label>
                                <Input disabled value={'-'} />
                            </div>
                        )}
                    <p className='p-1 text-xs font-bold text-center text-white rounded-sm sm:w-full bg-primary'>ENERGY CONSUMPTION</p>
                    {latestEnergyData?.data && latestEnergyData.data ?
                        (<div className='flex flex-row items-center justify-between'>
                            <Label className='text-xs sm:w-1/3'>Total kWh</Label>
                            <Input disabled value={`${calculateSimpleConsumption(latestEnergyData?.data).toFixed(2)} kW`} />
                        </div>
                        ) : (
                            <div className='flex flex-row items-center justify-between'>
                                <Label className='text-xs sm:w-1/3'>Total kWh</Label>
                                <Input disabled value={'-'} />
                            </div>
                        )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DeviceCard;
