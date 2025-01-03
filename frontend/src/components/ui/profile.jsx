import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "./card";
import { useState, useEffect } from "react";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Button } from "./button";

export function Profile({ error, data, onSave }) {
    const [formData, setFormData] = useState({
        Name: data?.Name || "",
        Email: data?.Email || "",
        Height: data?.Height || "",
        Weight: data?.Weight || "",
        Age: data?.Age || "",
        Gender: data?.Gender || "",
        BMR: data?.BMR || "",
        YearsOfWorkoutExperience: data?.YearsOfWorkoutExperience || "",
        Bio: data?.Bio || "",
    });

    useEffect(() => {
        if (data) {
            setFormData({
                Name: data.Name || "",
                Email: data.Email || "",
                Height: data.Height || "",
                Weight: data.Weight || "",
                Age: data.Age || "",
                Gender: data.Gender || "",
                BMR: data.BMR || "",
                YearsOfWorkoutExperience: data.YearsOfWorkoutExperience || "",
                Bio: data.Bio || "",
            });
        }
    }, [data]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-8xl mx-auto gap-10"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>
                            Update your account details and preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="Name">Name</Label>
                                <Input
                                    id="Name"
                                    type="text"
                                    value={formData.Name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="Email">Email</Label>
                                <Input
                                    id="Email"
                                    type="email"
                                    value={formData.Email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <CardDescription>Your Body</CardDescription>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="Height">Height (cm)</Label>
                                <Input
                                    id="Height"
                                    type="number"
                                    value={formData.Height}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="Weight">Weight (kg/lbs)</Label>
                                <Input
                                    id="Weight"
                                    type="number"
                                    value={formData.Weight}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="Age">Age</Label>
                                <Input
                                    id="Age"
                                    type="number"
                                    value={formData.Age}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="Gender">Gender</Label>
                                <Input
                                    id="Gender"
                                    type="text"
                                    value={formData.Gender}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="BMR">
                                    Basal Metabolic Rate
                                </Label>
                                <Input
                                    id="BMR"
                                    value={formData.BMR}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="YearsOfWorkoutExperience">
                                    Years of Working Out
                                </Label>
                                <Input
                                    id="YearsOfWorkoutExperience"
                                    value={formData.YearsOfWorkoutExperience}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Bio" type="text">
                                Bio
                            </Label>
                            <Textarea
                                id="Bio"
                                rows={3}
                                value={formData.Bio}
                                onChange={handleChange}
                            />
                        </div>
                        <Button className="w-full" size="lg" type="submit">
                            Save Changes
                        </Button>
                    </CardContent>
                    {error && <div className="error">{error}</div>}
                </Card>
            </form>
        </div>
    );
}
