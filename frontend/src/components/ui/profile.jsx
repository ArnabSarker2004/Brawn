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
                className="profile-edit-form"
            >
                <Card className="profile-edit-card">
                    <CardHeader className="profile-edit-header">
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>
                            Update your account details and preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="profile-edit-content">
                        <div className="profile-edit-grid">
                            <div className="profile-edit-field">
                                <Label htmlFor="Name">Name</Label>
                                <Input
                                    id="Name"
                                    type="text"
                                    placeholder="Your display name"
                                    value={formData.Name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="profile-edit-field">
                                <Label htmlFor="Email">Email</Label>
                                <Input
                                    id="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.Email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <CardDescription className="profile-edit-subtitle">Your Body</CardDescription>
                        <div className="profile-edit-grid">
                            <div className="profile-edit-field">
                                <Label htmlFor="Height">Height (cm)</Label>
                                <Input
                                    id="Height"
                                    type="number"
                                    placeholder="178"
                                    value={formData.Height}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="profile-edit-field">
                                <Label htmlFor="Weight">Weight (kg/lbs)</Label>
                                <Input
                                    id="Weight"
                                    type="number"
                                    placeholder="175"
                                    value={formData.Weight}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="profile-edit-grid">
                            <div className="profile-edit-field">
                                <Label htmlFor="Age">Age</Label>
                                <Input
                                    id="Age"
                                    type="number"
                                    placeholder="28"
                                    value={formData.Age}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="profile-edit-field">
                                <Label htmlFor="Gender">Gender</Label>
                                <Input
                                    id="Gender"
                                    type="text"
                                    placeholder="Male, female, non-binary..."
                                    value={formData.Gender}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="profile-edit-grid">
                            <div className="profile-edit-field">
                                <Label htmlFor="BMR">
                                    Basal Metabolic Rate
                                </Label>
                                <Input
                                    id="BMR"
                                    placeholder="1800"
                                    value={formData.BMR}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="profile-edit-field">
                                <Label htmlFor="YearsOfWorkoutExperience">
                                    Years of Working Out
                                </Label>
                                <Input
                                    id="YearsOfWorkoutExperience"
                                    placeholder="3"
                                    value={formData.YearsOfWorkoutExperience}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="profile-edit-field">
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
                        <Button className="profile-edit-submit" size="lg" type="submit">
                            Save Changes
                        </Button>
                    </CardContent>
                    {error && <div className="error">{error}</div>}
                </Card>
            </form>
        </div>
    );
}
