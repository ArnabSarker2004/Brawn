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
    chartData,
    WeeklyWorkouts,
    MemberSince,
    TotalWorkouts,
    CurrentWorkoutStreak,
}) => {
    return (
        <div>
            <div className="grid gap-5 md:grid-cols-4 grid-cols-1 w-full mb-4">
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Member Since
                    </CardHeader>
                    <CardContent className="text-xl font-semibold">
                        {moment(MemberSince).format("MMMM Do, YYYY")}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Total Workouts
                    </CardHeader>
                    <CardContent className="text-xl font-semibold">{TotalWorkouts}</CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Workout Streak
                    </CardHeader>
                    <CardContent className="text-xl font-semibold">{CurrentWorkoutStreak}</CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Last Workout
                    </CardHeader>
                    <CardContent className="text-xl font-semibold">
                        {WeeklyWorkouts.length > 0
                            ? moment(WeeklyWorkouts.flatMap(routine => routine.completionStats.map(stat => stat.date)).sort((a, b) => new Date(b) - new Date(a))[0]).format("MMM D, YYYY")
                            : "No workouts yet"}
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 w-full ">
                <Card>
                    <CardContent>
                        <CardHeader className="text-brawn font-semibold text-xl">
                            Your Activity This Month
                        </CardHeader>
                        <Activity chartData={chartData} />
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
