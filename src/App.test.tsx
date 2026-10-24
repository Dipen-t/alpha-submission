import { act, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("contact workspace", () => {
  it("changes stage directly in both views without opening a drawer or losing notes", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Stage for Olivia Rhye" }),
      "Customer",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Stage for Olivia Rhye" }),
    ).toHaveValue("Customer");
    await user.click(screen.getByRole("button", { name: "Board" }));
    const customer = screen.getByRole("region", { name: "Customer contacts" });
    await user.selectOptions(
      within(customer).getByRole("combobox", { name: "Stage for Olivia Rhye" }),
      "Lead",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const movedSelect = within(
      screen.getByRole("region", { name: "Lead contacts" }),
    ).getByRole("combobox", { name: "Stage for Olivia Rhye" });
    await waitFor(() => expect(movedSelect).toHaveFocus());
    expect(screen.getAllByRole("combobox")).toHaveLength(10);
    await user.click(screen.getByRole("button", { name: /Olivia Rhye/ }));
    expect(screen.getByLabelText("Stage")).toHaveValue("Lead");
    expect(
      (screen.getByLabelText(/Notes/) as HTMLTextAreaElement).value,
    ).toContain("Interested in a more connected workflow");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Table" }));
    expect(
      screen.getByRole("combobox", { name: "Stage for Olivia Rhye" }),
    ).toHaveValue("Lead");
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });
  afterEach(() => {
    Reflect.deleteProperty(document, "startViewTransition");
    vi.unstubAllGlobals();
  });

  it("keeps the last requested view when toggles happen before animation starts", async () => {
    const updates: (() => void)[] = [];
    const skip = vi.fn();
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: (update: () => void) => {
        updates.push(update);
        return {
          skipTransition: skip,
          ready: Promise.resolve(),
          finished: new Promise(() => {}),
        };
      },
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Board" }));
    await user.click(screen.getByRole("button", { name: "Table" }));
    act(() => updates.forEach((update) => update()));
    expect(skip).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Table" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });

  it("switches immediately without animation when reduced motion is preferred", async () => {
    const start = vi.fn();
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: start,
    });
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Board" }));
    expect(start).not.toHaveBeenCalled();
    expect(
      screen.getByRole("region", { name: "Customer contacts" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Olivia Rhye/ })).toHaveLength(
      1,
    );
  });

  it("saves Stage and Notes across both views and preserves record count through repeated edits", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Olivia Rhye/ }));
    await user.selectOptions(screen.getByLabelText("Stage"), "Customer");
    await user.clear(screen.getByLabelText(/Notes/));
    await user.type(
      screen.getByLabelText(/Notes/),
      "Signed. Start onboarding on Monday.",
    );
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const row = screen
      .getByRole("button", { name: /Olivia Rhye/ })
      .closest("tr")!;
    expect(within(row).getByText("Customer")).toBeInTheDocument();
    expect(
      within(row).getByText("Signed. Start onboarding on Monday."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Board" }));
    const customer = screen.getByRole("region", { name: "Customer contacts" });
    await user.click(
      within(customer).getByRole("button", { name: /Olivia Rhye/ }),
    );
    expect(screen.getByLabelText(/Notes/)).toHaveValue(
      "Signed. Start onboarding on Monday.",
    );
    await user.selectOptions(screen.getByLabelText("Stage"), "Lead");
    await user.clear(screen.getByLabelText(/Notes/));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(
      within(screen.getByRole("region", { name: "Lead contacts" })).getByRole(
        "button",
        { name: /Olivia Rhye/ },
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Olivia Rhye/ })).toHaveLength(
      1,
    );
    await user.click(screen.getByRole("button", { name: "Table" }));
    expect(screen.getAllByRole("row")).toHaveLength(11);
    await user.click(screen.getByRole("button", { name: /Olivia Rhye/ }));
    expect(screen.getByLabelText(/Notes/)).toHaveValue("");
    expect(screen.getByLabelText("Stage")).toHaveValue("Lead");
  });

  it("discards cancelled drafts, returns focus, and retains the board context", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Board" }));
    const trigger = screen.getByRole("button", { name: /Andi Lane/ });
    await user.click(trigger);
    expect(screen.getAllByText("Not added")).toHaveLength(2);
    expect(
      screen.getByText("Unassigned", {
        selector: ".contact-properties .missing",
      }),
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Stage"), "Customer");
    await user.type(screen.getByLabelText(/Notes/), " Unsaved");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Board" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.click(trigger);
    expect(screen.getByLabelText("Stage")).toHaveValue("Lead");
    expect(
      (screen.getByLabelText(/Notes/) as HTMLTextAreaElement).value,
    ).not.toContain("Unsaved");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      within(
        screen.getByRole("region", { name: "Customer contacts" }),
      ).getByText("No contacts yet"),
    ).toBeInTheDocument();
  });

  it("guards accidental closing and supports continuing or discarding changes", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Lana Steiner/ }));
    await user.type(screen.getByLabelText(/Notes/), " Draft");
    await user.click(
      screen.getByRole("button", { name: "Close contact details" }),
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(
      (screen.getByLabelText(/Notes/) as HTMLTextAreaElement).value,
    ).toContain("Draft");
    await user.click(
      screen.getByRole("button", { name: "Close contact details" }),
    );
    await user.click(screen.getByRole("button", { name: "Discard changes" }));
    await user.click(screen.getByRole("button", { name: /Lana Steiner/ }));
    expect(
      (screen.getByLabelText(/Notes/) as HTMLTextAreaElement).value,
    ).not.toContain("Draft");
  });

  it("preserves search across views and recovers from no results", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("searchbox"), "Layers");
    expect(screen.getAllByRole("row")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Board" }));
    expect(
      screen.getByRole("button", { name: /Olivia Rhye/ }),
    ).toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "zzzz");
    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });
});
