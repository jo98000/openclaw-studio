import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AgentCreateModal } from "@/features/agents/components/AgentCreateModal";
import { withIntl } from "./helpers/intlWrapper";

const openModal = (overrides?: {
  busy?: boolean;
  onClose?: () => void;
  onSubmit?: (payload: unknown) => void;
}) => {
  const onClose = overrides?.onClose ?? vi.fn();
  const onSubmit = overrides?.onSubmit ?? vi.fn();
  render(
    withIntl(
      createElement(AgentCreateModal, {
        open: true,
        suggestedName: "New Agent",
        busy: overrides?.busy,
        onClose,
        onSubmit,
      }),
    ),
  );
  return { onClose, onSubmit };
};

/** Select "blank" mode on step 0 and advance to step 1 (Identity). */
const selectBlankModeAndProceed = () => {
  // Step 0: select a creation mode (blank canvas)
  fireEvent.click(screen.getByText("Blank canvas"));
  // Advance to step 1 (Identity)
  fireEvent.click(screen.getByRole("button", { name: /Next/i }));
};

/** Navigate from step 0 (Mode) to step 4 (Capabilities) by selecting mode then clicking Next. */
const goToLastStep = () => {
  selectBlankModeAndProceed();
  // Step 1 (Identity) → Step 2 (Persona) → Step 3 (Model) → Step 4 (Capabilities)
  fireEvent.click(screen.getByRole("button", { name: /Next/i }));
  fireEvent.click(screen.getByRole("button", { name: /Next/i }));
  fireEvent.click(screen.getByRole("button", { name: /Next/i }));
};

describe("AgentCreateModal", () => {
  afterEach(() => {
    cleanup();
  });

  it("submits simple payload with name and avatar seed", () => {
    const onSubmit = vi.fn();
    openModal({ onSubmit });

    selectBlankModeAndProceed();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Execution Operator" },
    });
    // Navigate Identity → Persona → Model → Capabilities
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    fireEvent.click(screen.getByRole("button", { name: "Launch agent" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Execution Operator",
        avatarSeed: expect.any(String),
      }),
    );
  });

  it("submits when navigated via keyboard Enter and button click", () => {
    const onSubmit = vi.fn();
    openModal({ onSubmit });

    selectBlankModeAndProceed();
    const nameInput = screen.getByLabelText("Name");
    fireEvent.change(nameInput, {
      target: { value: "Keyboard Agent" },
    });
    // Enter on name input advances to step 2 (Persona)
    fireEvent.keyDown(nameInput, { key: "Enter" });
    // Click Next twice to go through Persona → Model → Capabilities
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    // Click Launch to submit
    fireEvent.click(screen.getByRole("button", { name: "Launch agent" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Keyboard Agent",
      }),
    );
  });

  it("renders 5-step wizard starting on Mode step", () => {
    openModal();

    // Step 0 has Next button, not Launch agent
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
    // Step indicator shows all 5 steps
    expect(screen.getByText("Mode")).toBeInTheDocument();
    expect(screen.getByText("Identity")).toBeInTheDocument();
    expect(screen.getByText("Persona")).toBeInTheDocument();
    expect(screen.getByText("AI & Model")).toBeInTheDocument();
    expect(screen.getByText("Capabilities")).toBeInTheDocument();
    // Launch agent only appears on the last step
    expect(
      screen.queryByRole("button", { name: "Launch agent" }),
    ).not.toBeInTheDocument();
  });

  it("disables Next when no mode is selected on step 0", () => {
    openModal();

    // Next button should be disabled when no mode is selected
    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton).toBeDisabled();
  });

  it("shows launching state while busy", () => {
    openModal({ busy: true });

    // Navigate to the last step first
    goToLastStep();

    expect(screen.getByRole("button", { name: "Launching..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
  });

  it("calls onClose when close is pressed", () => {
    const onClose = vi.fn();
    openModal({ onClose });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not reset typed name when suggestedName changes while open", () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    const view = render(
      withIntl(
        createElement(AgentCreateModal, {
          open: true,
          suggestedName: "New Agent",
          onClose,
          onSubmit,
        }),
      ),
    );

    // Go to step 1 (Identity) first to see the name field
    selectBlankModeAndProceed();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "My Draft Name" },
    });

    view.rerender(
      withIntl(
        createElement(AgentCreateModal, {
          open: true,
          suggestedName: "New Agent 2",
          onClose,
          onSubmit,
        }),
      ),
    );

    expect(screen.getByLabelText("Name")).toHaveValue("My Draft Name");
  });
});
