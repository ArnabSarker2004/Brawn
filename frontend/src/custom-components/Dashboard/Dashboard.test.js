import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SocialPostsProvider } from "../../context/SocialPostsContext";
import Messages from "../../pages/Messages";
import Dashboard from "./Dashboard";

jest.mock("../../context/AuthContext", () => ({
    useAuth: () => ({ user: "arnab" }),
}));

const renderDashboard = () =>
    render(
        <BrowserRouter>
            <SocialPostsProvider>
                <Dashboard
                    CurrentWorkoutStreak={4}
                    WeeklyWorkouts={[]}
                    TotalWorkouts={12}
                    user="arnab"
                    routines={[]}
                />
            </SocialPostsProvider>
        </BrowserRouter>
    );

beforeEach(() => {
    window.localStorage.clear();
    window.scrollTo = jest.fn();
    window.requestAnimationFrame = (callback) => callback();
    window.matchMedia = jest.fn().mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    });
});

test("likes posts and adds persistent comments", () => {
    renderDashboard();

    const likeButton = screen.getByRole("button", { name: "Like Maya's post" });
    fireEvent.click(likeButton);
    expect(screen.getByRole("button", { name: "Unlike Maya's post" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Comment on Maya's post" }));
    const commentInput = screen.getByRole("textbox", { name: "Comment on Maya's post" });
    fireEvent.change(commentInput, { target: { value: "Strong work." } });
    fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

    expect(screen.getByText("Strong work.")).toBeInTheDocument();
    expect(window.localStorage.getItem("brawn-social-comments")).toContain("Strong work.");
});

test("opens stories and sends them into a message thread", () => {
    renderDashboard();

    fireEvent.click(screen.getByRole("button", { name: "View Maya's story: Leg day PR" }));
    const storyDialog = screen.getByRole("dialog", { name: "Maya's story" });
    fireEvent.click(within(storyDialog).getByRole("button", { name: "Send story" }));

    const shareDialog = screen.getByRole("dialog", { name: "Send story" });
    fireEvent.click(within(shareDialog).getByRole("button", { name: /Maya/ }));

    expect(window.localStorage.getItem("brawn-social-sent-items")).toContain('"threadId":"maya"');
});

test("shows homepage shares inside the matching message thread", async () => {
    window.localStorage.setItem(
        "brawn-social-sent-items",
        JSON.stringify([
            {
                id: "sent-test",
                threadId: "maya",
                itemId: "story-maya",
                itemType: "story",
                title: "Maya's story",
                preview: "Leg day PR",
                url: "http://localhost/dashboard?story=story-maya",
                createdAt: new Date().toISOString(),
            },
        ])
    );

    render(
        <BrowserRouter>
            <SocialPostsProvider>
                <Messages />
            </SocialPostsProvider>
        </BrowserRouter>
    );

    expect((await screen.findAllByText("Shared a story: Maya's story")).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Open story" })).toHaveAttribute(
        "href",
        "http://localhost/dashboard?story=story-maya"
    );
});
