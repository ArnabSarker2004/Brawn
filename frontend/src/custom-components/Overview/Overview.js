import moment from "moment";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import Activity from "./Activity";

//NO API CALLS HERE EITHER, ALL SHOULD BE MADE IN pages/dashboard.js

const Overview = ({
    WeeklyWorkouts,
    MemberSince,
    TotalWorkouts,
    LongestWorkoutStreak,
}) => {
    return (
        <div>
            <div className="grid gap-5 md:grid-cols-4 grid-cols-1 w-full mb-4">
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Member Since
                    </CardHeader>
                    <CardContent>
                        {moment(MemberSince).format("MMMM Do, YYYY")}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Total Workouts
                    </CardHeader>
                    <CardContent>{TotalWorkouts}</CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Workout Streak
                    </CardHeader>
                    <CardContent>{LongestWorkoutStreak}</CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Next Workout On
                    </CardHeader>
                    <CardContent>Jan 1</CardContent>
                </Card>
            </div>
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 w-full ">
                <Card>
                    <CardContent>
                        <CardHeader className="text-brawn font-semibold text-xl">
                            Your Activity This Month
                        </CardHeader>
                        <Activity />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-semibold text-xl">
                        Workouts This Week
                    </CardHeader>
                    <CardContent>
                        <div className=" max-h-96 overflow-y-scroll">
                            <Table>
                                <TableHeader>
                                    <TableHead className="font-medium">
                                        Workout
                                    </TableHead>
                                    <TableHead className="font-medium">
                                        Duration
                                    </TableHead>
                                    <TableHead className="font-medium">
                                        Date
                                    </TableHead>
                                </TableHeader>
                                <TableBody>
                                    {WeeklyWorkouts.flatMap((routine) =>
                                        routine.completionStats.map((stat) => ({
                                            name: routine.name,
                                            totalTime: stat.totalTime,
                                            date: stat.date,
                                        }))
                                    )
                                        .sort(
                                            (a, b) =>
                                                new Date(b.date) -
                                                new Date(a.date)
                                        )
                                        .map((workout, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {workout.name}
                                                </TableCell>
                                                <TableCell>
                                                    {moment
                                                        .utc(
                                                            workout.totalTime *
                                                                1000
                                                        )
                                                        .format("H:mm:ss")}
                                                </TableCell>
                                                <TableCell>
                                                    {moment(
                                                        workout.date
                                                    ).format(
                                                        "dddd, MM/DD/YYYY"
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Overview;
