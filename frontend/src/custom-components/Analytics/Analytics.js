import { Card, CardContent, CardHeader } from "../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
const Analytics = () =>{
    return (
        <div>
            <div className="grid gap-5 grid-cols-1 md:grid-cols-4 w-full mb-4"> 
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Current Weight
                    </CardHeader>
                    <CardContent>

                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Best Workout Streak
                    </CardHeader>
                    <CardContent>

                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Average Step Count
                    </CardHeader>
                    <CardContent>

                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="text-brawn font-medium text-sm">
                        Distance Ran
                    </CardHeader>
                </Card>
            </div>
            <div className="grid gap-5 md:grid-cols-2 grid-cols-1 w-full">
                <Card>
                    <CardContent>
                    </CardContent>
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
                                    <TableCell>
                                        Run
                                    </TableCell>
                                    <TableCell>
                                        10 km
                                    </TableCell>
                                    <TableCell>
                                        Jan-1
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Analytics;