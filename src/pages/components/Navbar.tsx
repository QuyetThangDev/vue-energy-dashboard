import { useState } from "react";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
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

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Clock, Settings } from "lucide-react";

const Navbar = () => {
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [timeout, setTimeout] = useState(5000);
    const [error, setError] = useState<string | null>(null);

    const handleSaveChanges = () => {
        if (startDate && endDate && startDate > endDate) {
            setError("Start date cannot be later than end date.");
        } else {
            setError(null);
            console.log("Start Date:", startDate);
            console.log("End Date:", endDate);
            console.log("Interval:", timeout);
        }
    };

    // Function to convert timeout value to readable format
    const formatTimeout = (ms: number) => {
        if (ms < 60000) {
            return `${ms / 1000} second${ms / 1000 > 1 ? 's' : ''}`;
        } else {
            return `${ms / 60000} minute${ms / 60000 > 1 ? 's' : ''}`;
        }
    };

    return (
        <div className="flex flex-col w-full">
            <header className="sticky top-0 flex items-center justify-between gap-4 px-4 border-b h-14 bg-background md:px-6">
                <div>
                    <NavLink to="/" className="text-lg font-bold">Energy Monitor</NavLink>
                </div>
                <nav className="flex-col hidden gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Settings className="w-3.5 h-3.5 mr-1" />
                                Setting
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] sm:items-center items-start">
                            <DialogHeader>
                                <DialogTitle>Setting</DialogTitle>
                                <DialogDescription>
                                    {/* Make changes to your profile here. Click save when you're done. */}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-row items-center justify-between gap-4">
                                    <p className="w-1/4 text-sm text-left text-gray-500">
                                        Start date
                                    </p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] justify-start text-center font-normal",
                                                    !startDate && "text-muted-foreground"
                                                )}
                                            >
                                                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="start"
                                            className="flex flex-col w-auto p-2 space-y-2"
                                        >
                                            <Select
                                                onValueChange={(value) =>
                                                    setStartDate(addDays(new Date(), parseInt(value)))
                                                }
                                            >
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
                                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex flex-row items-center justify-between gap-4">
                                    <p className="w-1/4 text-sm text-left text-gray-500">
                                        End date
                                    </p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] justify-start text-center font-normal",
                                                    !endDate && "text-muted-foreground"
                                                )}
                                            >
                                                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="start"
                                            className="flex flex-col w-auto p-2 space-y-2"
                                        >
                                            <Select
                                                onValueChange={(value) =>
                                                    setEndDate(addDays(new Date(), parseInt(value)))
                                                }
                                            >
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
                                                <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex flex-row items-center justify-between gap-4">
                                    <p className="w-1/4 text-sm text-left text-gray-500">
                                        Interval
                                    </p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="outline" className="w-[240px] justify-start text-center font-normal p-3 gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span className="flex justify-start w-full">{formatTimeout(timeout)}</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setTimeout(5000)}>
                                                <p className="w-full">5 seconds</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTimeout(10000)}>
                                                <p className="w-full">10 seconds</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTimeout(30000)}>
                                                <p className="w-full">30 seconds</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTimeout(60000)}>
                                                <p className="w-full">1 minute</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTimeout(120000)}>
                                                <p className="w-full">2 minutes</p>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTimeout(300000)}>
                                                <p className="w-full">5 minutes</p>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-500">{error}</p>
                            )}
                            <DialogFooter>
                                <Button type="button" onClick={handleSaveChanges}>
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </nav>
            </header>
        </div>
    );
};

export default Navbar;
