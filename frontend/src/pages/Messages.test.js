import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SocialPostsProvider } from "../context/SocialPostsContext";
import Messages from "./Messages";

jest.mock("../context/AuthContext", () => ({
    useAuth: () => ({ user: "arnab" }),
}));

const renderMessages = () =>
    render(
        <BrowserRouter>
            <SocialPostsProvider>
                <Messages />
            </SocialPostsProvider>
        </BrowserRouter>
    );

beforeEach(() => {
    window.localStorage.clear();
    window.requestAnimationFrame = (callback) => callback();
});

test("searches conversations and clears the filter", () => {
    renderMessages();

    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "Coach" } });

    expect(screen.getAllByText("Coach AI").length).toBeGreaterThan(0);
    expect(screen.queryByText("Jordan Miles")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear message search" }));
    expect(screen.getAllByText("Jordan Miles").length).toBeGreaterThan(0);
});

test("creates a conversation, sends text, and adds an emoji", () => {
    renderMessages();

    fireEvent.click(screen.getAllByRole("button", { name: "New DM" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Start a conversation" });
    fireEvent.change(within(dialog).getByLabelText("Name"), { target: { value: "Taylor Reed" } });
    fireEvent.change(within(dialog).getByLabelText("Handle"), { target: { value: "taylor.lifts" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Create chat" }));

    const composer = screen.getByRole("textbox", { name: "Message Taylor" });
    fireEvent.change(composer, { target: { value: "Ready to train " } });
    fireEvent.click(screen.getByRole("button", { name: "Add reaction" }));
    fireEvent.click(screen.getByRole("button", { name: "Add 💪" }));
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getAllByText("Ready to train 💪").length).toBeGreaterThan(0);
    expect(window.localStorage.getItem("brawn-message-threads")).toContain("Ready to train");
});

test("runs call controls and conversation actions", () => {
    renderMessages();

    fireEvent.click(screen.getByRole("button", { name: "Voice call" }));
    const callDialog = screen.getByRole("dialog", { name: "voice call with Maya Chen" });
    fireEvent.click(within(callDialog).getByRole("button", { name: "Mute microphone" }));
    expect(within(callDialog).getByRole("button", { name: "Unmute microphone" })).toBeInTheDocument();
    fireEvent.click(within(callDialog).getByRole("button", { name: "End call" }));
    expect(screen.getAllByText("Voice call ended").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "More conversation actions" }));
    fireEvent.click(screen.getByRole("button", { name: "Mute notifications" }));
    expect(screen.getByText("Muted")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Conversation info" }));
    expect(screen.getByRole("dialog", { name: "Details" })).toBeInTheDocument();
});

test("sends an attachment and confirms before clearing messages", async () => {
    const { container } = renderMessages();
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(["training notes"], "session.txt", { type: "text/plain" });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(await screen.findByText("session.txt")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByRole("link", { name: /session.txt/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "More conversation actions" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear conversation" }));
    const confirmDialog = screen.getByRole("alertdialog", { name: "Clear this conversation?" });
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Clear messages" }));

    expect(screen.getByText("Start the conversation")).toBeInTheDocument();
});
