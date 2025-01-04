import { Card, CardContent, CardHeader } from "../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

//NOTE DO NOT MAKE ANY API CALLS FROM HERE, API CALLS SHOULD NOT BE MADE THROUGH COMPONENTS
const Analytics = ({ workouts, user }) => {
    // Calculate total cardio workouts time
    const totalCardioTime = workouts
        ?.filter(w => w.cardio)
        ?.reduce((total, workout) => {
            return total + workout.sets.reduce((setTotal, set) => setTotal + (set.time || 0), 0);
        }, 0) || 0;

    // Calculate total strength workouts time
    const totalStrengthTime = workouts
        ?.filter(w => !w.cardio)
        ?.reduce((total, workout) => {
            return total + workout.sets.reduce((setTotal, set) => setTotal + (set.time || 0), 0);
        }, 0) || 0;

    return (
        <div>
            <div className="grid gap-5 grid-cols-1 md:grid-cols-4 w-full mb-4">
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Current Weight
                    </CardHeader>
                    <CardContent className="text-xl font-semibold">
                        {user?.weight ? `${user.weight}` : 'Does not exist'}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Best Workout Streak
                    </CardHeader>
                    <CardContent></CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Total Cardio Time
                    </CardHeader>
                    <CardContent className="text-xl font-semibold">
                        {Math.round(totalCardioTime / 60)} mins
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Total Strength Time
                    </CardHeader>
                    <CardContent className="text-xl font-semibold">
                        {Math.round(totalStrengthTime / 60)} mins
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-5 md:grid-cols-2 grid-cols-1 w-full">
                <Card>
                    <CardContent></CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-semibold text-xl">
                        Personal Records
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableHead className="font-medium">
                                    Excercise
                                </TableHead>
                                <TableHead className="font-medium">
                                    Best Performance
                                </TableHead>
                                <TableHead className="font-medium">
                                    Date
                                </TableHead>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Run</TableCell>
                                    <TableCell>10 km</TableCell>
                                    <TableCell>Jan-1</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;