
import { useQuery } from '@tanstack/react-query';

import { getDevices } from '@/api/device';

import { Label } from "@/components/ui/label";
import { Spinner } from '@/components/ui/spinner';
import DeviceCard from './DeviceCard';

// Define types for better type safety
interface Voltage {
    phaseA: number;
    phaseB: number;
    phaseC: number;
}

interface Current {
    currentA: number;
    currentB: number;
    currentC: number;
}

interface Power {
    cosp: number;
    activePower: number;
    energy: number;
}

interface DataItem {
    voltage: Voltage[];
    current: Current[];
    power: Power[];
}

interface Item {
    id: string;
    name: string;
    type: string;
    location: string;
    data: DataItem[];
    tags: string[];
}

const PowerMeter = () => {

    // Query to fetch devices
    const { data: devicesData, isLoading, error } = useQuery({
        queryKey: ['devices'],
        queryFn: () => getDevices({ tags: ['1 Phase'], page: 1, pageSize: 10 }),
        staleTime: 60000, // Cache data for 1 minute
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

    return (
        <>
            <Label className="mb-4 text-xl font-bold text-start sm:text-2xl sm:text-center">
                Dashboard
            </Label>


            <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
                {Array.isArray(devicesData?.data?.items) ? devicesData.data.items.map((item: Item) => (
                    <DeviceCard item={item} key={item.id} timeout={10} />
                )) : null}
            </div>
        </>
    );
};

export default PowerMeter;
