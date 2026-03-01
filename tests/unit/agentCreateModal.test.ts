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
    withIntl(createElement(AgentCreateModal, {
      open: true,
      suggestedName: "New Agent",
      busy: overrides?.busy,
      onClose,
      onSubmit,
    }))
  );
  return { onClose, onSubmit };
};

/** Navigate from step 0 (Identity) to step 2 (Capabilities) by clicking Next twice. */
const goToLastStep = () => {
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

    fireEvent.change(screen.getByLabelText("Agent name"), {
      target: { value: "Execution Operator" },
    });
    goToLastStep();
    fireEvent.click(screen.getByRole("button", { name: "Launch agent" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Execution Operator",
        avatarSeed: expect.any(String),
      })
    );
  });

  it("submits when the form is submitted from keyboard flow", () => {
    const onSubmit = vi.fn();
    openModal({ onSubmit });

    fireEvent.change(screen.getByLabelText("Agent name"), {
      target: { value: "Keyboard Agent" },
    });
    // Each form submit advances one step; third submit triggers launch
    fireEvent.submit(screen.getByTestId("agent-create-modal"));
    fireEvent.submit(screen.getByTestId("agent-create-modal"));
    fireEvent.submit(screen.getByTestId("agent-create-modal"));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Keyboard Agent",
      })
    );
  });

  it("renders 3-step wizard starting on Identity step", () => {
    openModal();

    // Step 0 has Next button, not Launch agent
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Agent name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Shuffle avatar selection" })).toBeInTheDocument();
    // Step indicator shows Identity, AI & Model, Capabilities
    expect(screen.getByText("Identity")).toBeInTheDocument();
    expect(screen.getByText("AI & Model")).toBeInTheDocument();
    expect(screen.getByText("Capabilities")).toBeInTheDocument();
    // Launch agent only appears on the last step
    expect(screen.queryByRole("button", { name: "Launch agent" })).not.toBeInTheDocument();
  });

  it("disables launch when the name is blank", () => {
    const onSubmit = vi.fn();
    openModal({ onSubmit });

    fireEvent.change(screen.getByLabelText("Agent name"), {
      target: { value: "   " },
    });
    // Next button should be disabled when name is blank
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
      withIntl(createElement(AgentCreateModal, {
        open: true,
        suggestedName: "New Agent",
        onClose,
        onSubmit,
      }))
    );

    fireEvent.change(screen.getByLabelText("Agent name"), {
      target: { value: "My Draft Name" },
    });

    view.rerender(
      withIntl(createElement(AgentCreateModal, {
        open: true,
        suggestedName: "New Agent 2",
        onClose,
        onSubmit,
      }))
    );

    expect(screen.getByLabelText("Agent name")).toHaveValue("My Draft Name");
  });
});
