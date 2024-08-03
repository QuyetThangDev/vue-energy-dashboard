import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useParams } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { addDays, differenceInDays, format } from "date-fns";

import { getDeviceAttributes } from "@/api/telemetry";
import { getDeviceById } from '@/api/device';

import VoltageChart from './components/ChartComponent/VoltageChart';
import CurrentChart from './components/ChartComponent/CurrentChart';
import PowerChart from './components/ChartComponent/PowerChart';
import EnergyConsumptionChart from './components/ChartComponent/EnergyConsumptionChart';

import { Label } from '@radix-ui/react-label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Settings } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const DeviceDetail = () => {
    const { deviceId } = useParams<{ deviceId: string }>();
    const [timeout, setTimeout] = useState('REALTIME');
    const [tempTimeout, setTempTimeout] = useState('REALTIME');

    // Create the first day of the month and today's date
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Initialize state with the first day of the month and today's date
    const [startDate, setStartDate] = useState<Date>(firstDayOfMonth);
    const [endDate, setEndDate] = useState<Date>(today);
    const [tempStartDate, setTempStartDate] = useState<Date | undefined>(firstDayOfMonth);
    const [tempEndDate, setTempEndDate] = useState<Date | undefined>(today);
    const [settingError, setSettingError] = useState<string | null>(null);
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: location } = useQuery({
        queryKey: ['location', deviceId],
        queryFn: () => getDeviceAttributes({
            deviceId: deviceId as string,
            keys: ['location'],
        }),
        enabled: !!deviceId,
    });

    // Get device information
    const { data: device } = useQuery({
        queryKey: ['device', deviceId],
        queryFn: () => getDeviceById(
            deviceId as string
        ),
        enabled: !!deviceId,
    });

    const handleStartDateChange = (date: Date | undefined) => {
        if (date) {
            setTempStartDate(date);
        }
        setStartDateOpen(false); // Close popover when date is selected
    };

    const handleEndDateChange = (date: Date | undefined) => {
        if (date) {
            setTempEndDate(date);
        }
        setEndDateOpen(false); // Close popover when date is selected
    };

    const handleSaveChanges = () => {
        if (!tempStartDate || !tempEndDate) {
            setSettingError("Both start and end dates must be selected.");
            return;
        }

        if (tempStartDate > tempEndDate) {
            setSettingError("Start date cannot be later than end date.");
            return;
        }

        if (tempTimeout === "HOUR" && differenceInDays(tempEndDate, tempStartDate) > 3) {
            setSettingError("For 'HOUR' interval, the date range cannot exceed 3 days.");
            return;
        }

        setSettingError(null);
        // Assuming setStartDate, setEndDate, and setTimeout are functions to save your settings
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        setTimeout(tempTimeout);
        setDialogOpen(false);

        setTempStartDate(undefined);
        setTempEndDate(undefined);
    };

    return (
        <main className='grid gap-2 px-3 py-1'>
            <div className='flex flex-row items-center justify-between w-full'>
                <Label className="flex flex-col justify-start gap-1 mb-2 font-bold">
                    {device?.data.name || 'Unknown'}
                    <div className='flex flex-row items-center gap-1 text-sm font-normal text-gray-400'>
                        <MapPin size={12} />
                        {location?.data && location.data[0].value || 'Unknown'}
                    </div>
                </Label>
                <div className='flex flex-row items-center gap-2'>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setDialogOpen(true)}>
                                <Settings className="w-3.5 h-3.5 mr-1" />
                                Settings
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[425px] sm:items-center items-start">
                            <DialogHeader>
                                <DialogTitle>Settings</DialogTitle>
                                <DialogDescription>
                                    Make changes to your profile here. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="flex flex-row items-center justify-between gap-4">
                                    <p className="w-1/4 text-sm text-left text-gray-500">Interval</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="outline" className="w-[240px] justify-start text-center font-normal p-3 gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span className="flex justify-start w-full">{tempTimeout}</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setTempTimeout('REALTIME')}>
                                                <p className="w-full">REALTIME</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTempTimeout('HOUR')}>
                                                <p className="w-full">HOUR</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTempTimeout('DAY')}>
                                                <p className="w-full">DAY</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTempTimeout('WEEK')}>
                                                <p className="w-full">WEEK</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTempTimeout('MONTH')}>
                                                <p className="w-full">MONTH</p>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {tempTimeout !== "REALTIME" && (
                                    <>
                                        <div className="flex flex-row items-center justify-between gap-4">
                                            <p className="w-1/4 text-sm text-left text-gray-500">Start date</p>
                                            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] justify-start text-center font-normal",
                                                            !tempStartDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {tempStartDate ? format(tempStartDate, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="flex flex-col w-auto p-2 space-y-2">
                                                    <Select onValueChange={(value) => handleStartDateChange(addDays(new Date(), parseInt(value)))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            <SelectItem value="0">Today</SelectItem>
                                                            <SelectItem value="1">Tomorrow</SelectItem>
                                                            <SelectItem value="3">In 3 days</SelectItem>
                                                            <SelectItem value="7">In a week</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="border rounded-md">
                                                        <Calendar mode="single" selected={tempStartDate} onSelect={handleStartDateChange} />
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex flex-row items-center justify-between gap-4">
                                            <p className="w-1/4 text-sm text-left text-gray-500">End date</p>
                                            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] justify-start text-center font-normal",
                                                            !tempEndDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {tempEndDate ? format(tempEndDate, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="flex flex-col w-auto p-2 space-y-2">
                                                    <Select onValueChange={(value) => handleEndDateChange(addDays(new Date(), parseInt(value)))}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            <SelectItem value="0">Today</SelectItem>
                                                            <SelectItem value="1">Tomorrow</SelectItem>
                                                            <SelectItem value="3">In 3 days</SelectItem>
                                                            <SelectItem value="7">In a week</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="border rounded-md">
                                                        <Calendar mode="single" selected={tempEndDate} onSelect={handleEndDateChange} />
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </>
                                )}
                            </div>

                            {settingError && <p className="mt-2 text-sm text-red-500">{settingError}</p>}
                            <DialogFooter>
                                <Button type="button" onClick={handleSaveChanges}>Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {/* <Tabs defaultValue="account" className="min-w-[300px]">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="5seconds">5 seconds</TabsTrigger>
                            <TabsTrigger value="30seconds">30 seconds</TabsTrigger>
                            <TabsTrigger value="1minute">1 minute</TabsTrigger>
                            <TabsTrigger value="5minutes">5 minutes</TabsTrigger>
                        </TabsList>
                    </Tabs> */}
                </div>

            </div>

            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                {/* Voltage Chart */}
                <VoltageChart deviceId={deviceId} startDate={startDate} endDate={endDate} timeout={timeout} />

                {/* Current Chart */}
                <CurrentChart deviceId={deviceId} startDate={startDate} endDate={endDate} timeout={timeout} />

                {/* Power Chart */}
                <PowerChart deviceId={deviceId} startDate={startDate} endDate={endDate} timeout={timeout} />

                {/* Energy Consumption Chart */}
                <EnergyConsumptionChart deviceId={deviceId} startDate={startDate} endDate={endDate} timeout={timeout} />
            </div>
        </main>
    );
};

export default DeviceDetail;
