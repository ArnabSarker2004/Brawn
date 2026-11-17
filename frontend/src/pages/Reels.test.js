import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SocialPostsProvider } from "../context/SocialPostsContext";
import Reels from "./Reels";

jest.mock("../context/AuthContext", () => ({
    useAuth: () => ({ user: "arnab" }),
}));

const renderReels = () =>
    render(
        <BrowserRouter>
            <SocialPostsProvider>
                <Reels />
            </SocialPostsProvider>
        </BrowserRouter>
    );

beforeEach(() => {
    window.localStorage.clear();
    window.requestAnimationFrame = (callback) => callback();
    window.cancelAnimationFrame = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
});

test("controls playback, audio, likes, saves, and following", () => {
    renderReels();
    const reel = screen.getByRole("article", { name: "Top Set: Incline Press by Maya Chen" });

    fireEvent.click(within(reel).getByRole("button", { name: "Pause Top Set: Incline Press" }));
    expect(within(reel).getByRole("button", { name: "Play Top Set: Incline Press" })).toBeInTheDocument();

    fireEvent.click(within(reel).getByRole("button", { name: "Unmute clip" }));
    expect(within(reel).getByRole("button", { name: "Mute clip" })).toBeInTheDocument();

    fireEvent.click(within(reel).getByRole("button", { name: "Like clip" }));
    expect(within(reel).getByRole("button", { name: "Unlike clip" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(within(reel).getByRole("button", { name: "Save clip" }));
    expect(within(reel).getByRole("button", { name: "Remove saved clip" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(within(reel).getByRole("button", { name: "Follow maya.moves" }));
    expect(within(reel).getByRole("button", { name: "Unfollow maya.moves" })).toBeInTheDocument();
    expect(window.localStorage.getItem("brawn-reels-following")).toContain("maya.moves");
});

test("adds comments and sends reels to messages", () => {
    renderReels();
    const reel = screen.getByRole("article", { name: "Top Set: Incline Press by Maya Chen" });

    fireEvent.click(within(reel).getByRole("button", { name: "View comments" }));
    const commentsDialog = screen.getByRole("dialog", { name: "Comments" });
    const commentInput = within(commentsDialog).getByRole("textbox", { name: "Comment on Top Set: Incline Press" });
    fireEvent.change(commentInput, { target: { value: "Excellent control." } });
    fireEvent.click(within(commentsDialog).getByRole("button", { name: "Post comment" }));
    expect(within(commentsDialog).getByText("Excellent control.")).toBeInTheDocument();
    fireEvent.click(within(commentsDialog).getByRole("button", { name: "Close comments" }));

    fireEvent.click(within(reel).getByRole("button", { name: "Share clip" }));
    const shareDialog = screen.getByRole("dialog", { name: "Top Set: Incline Press" });
    fireEvent.click(within(shareDialog).getByRole("button", { name: /Maya/ }));
    expect(window.localStorage.getItem("brawn-social-sent-items")).toContain('"itemType":"reel"');
});

test("reposts to Home and completes hide and report flows", () => {
    renderReels();
    const reel = screen.getByRole("article", { name: "Top Set: Incline Press by Maya Chen" });

    fireEvent.click(within(reel).getByRole("button", { name: "Repost clip" }));
    expect(within(reel).getByRole("button", { name: "Remove repost" })).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem("brawn-social-user-posts")).toContain("Top Set: Incline Press");

    fireEvent.click(within(reel).getByRole("button", { name: "More options" }));
    const options = screen.getByRole("dialog", { name: "More options for Top Set: Incline Press" });
    fireEvent.click(within(options).getByRole("button", { name: /Not interested/ }));
    expect(screen.queryByRole("article", { name: "Top Set: Incline Press by Maya Chen" })).not.toBeInTheDocument();

    const techniqueReel = screen.getByRole("article", { name: "Lengthened-Biased Pulldown by Coach AI" });
    fireEvent.click(within(techniqueReel).getByRole("button", { name: "More options" }));
    fireEvent.click(screen.getByRole("button", { name: /Report/ }));
    const reportDialog = screen.getByRole("dialog", { name: "What is the issue?" });
    fireEvent.click(within(reportDialog).getByRole("radio", { name: "Unsafe training advice" }));
    fireEvent.click(within(reportDialog).getByRole("button", { name: "Submit report" }));

    expect(screen.queryByRole("article", { name: "Lengthened-Biased Pulldown by Coach AI" })).not.toBeInTheDocument();
});

test("filters following reels and resets an empty feed", () => {
    renderReels();
    const filters = screen.getByRole("navigation", { name: "Reels feed filters" });
    fireEvent.click(within(filters).getByRole("button", { name: "Following" }));

    expect(screen.getByRole("article", { name: "Lengthened-Biased Pulldown by Coach AI" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "Posterior Chain Block by Sam Patel" })).not.toBeInTheDocument();

    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "not a real reel" } });
    expect(screen.getByText("No reels found")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset feed" }));
    expect(screen.getByRole("article", { name: "Top Set: Incline Press by Maya Chen" })).toBeInTheDocument();
});
