// src/components/Content.tsx

import { useState } from "react";
import UIButton from "./ui/UIButton";
import UIToggle from "./ui/UIToggle";
import UITextField from "./ui/UITextField";
import {
  buttonExamples,
  additionalButtonExamples,
  toggleExamples,
  textFieldExamples,
  handleButtonClick,
  handleToggleChange,
  handleInputChange,
} from "../data/config";
import { ToggleCallback, InputCallback } from "../data/interfaces";
import { getToggleIcons, getInputIcons } from "../data/icons";

const Content = () => {
  // State to track all toggle states
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    () => {
      // Initialize with default states from toggleExamples
      const initialStates: Record<string, boolean> = {};
      toggleExamples.forEach((toggle) => {
        initialStates[toggle.id] = toggle.checked;
      });
      // Add the demo toggles
      initialStates["toggle-small-demo"] = true;
      initialStates["toggle-medium-demo"] = true;
      initialStates["toggle-large-demo"] = true;
      return initialStates;
    }
  );

  // Custom toggle handler that updates state
  const handleToggleStateChange: ToggleCallback = (
    toggleData,
    checked,
    event
  ) => {
    // Update local state
    setToggleStates((prev) => ({
      ...prev,
      [toggleData.id]: checked,
    }));

    // Call the original handler for logging/other actions
    handleToggleChange(toggleData, checked, event);
  };

  // State to track input field values
  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const initialValues: Record<string, string> = {};
    textFieldExamples.forEach((input) => {
      initialValues[input.id] = input.value || "";
    });
    return initialValues;
  });

  // Custom input handler that updates state
  const handleInputStateChange: InputCallback = (inputData, value, event) => {
    // Update local state
    setInputValues((prev) => ({
      ...prev,
      [inputData.id]: value,
    }));

    // Call the original handler for logging/other actions
    handleInputChange(inputData, value, event);
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 bg-theme-gradient">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Button Examples */}
        <div className="card-theme-glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6 text-center">
            Button Examples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buttonExamples.map((buttonData) => (
              <UIButton
                key={buttonData.id}
                data={buttonData}
                onClick={handleButtonClick}
              />
            ))}
          </div>

          {/* Additional Button States */}
          <div className="mt-8 pt-6 border-t border-theme-tertiary">
            <h3 className="text-lg font-semibold text-theme-primary mb-4 text-center">
              Additional States & Sizes
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {additionalButtonExamples.map((buttonData) => (
                <UIButton
                  key={buttonData.id}
                  data={buttonData}
                  onClick={handleButtonClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Glowing Card */}
          <div className="group relative card-theme-glass rounded-2xl p-6 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-theme-primary mb-3">
                Glowing Card
              </h3>
              <p className="text-theme-secondary mb-4">
                This card has a subtle glow effect on hover, inspired by the
                futuristic aesthetic.
              </p>
              <div className="flex gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div
                  className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-300 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Data Card */}
          <div className="bg-theme-secondary border border-theme-tertiary rounded-2xl p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-theme-secondary">CPU Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 progress-theme-bg rounded-full overflow-hidden">
                    <div className="w-3/4 h-full progress-theme-fill-blue rounded-full"></div>
                  </div>
                  <span className="text-blue-400 font-semibold">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-secondary">Memory</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 progress-theme-bg rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"></div>
                  </div>
                  <span className="text-green-400 font-semibold">50%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-secondary">Network</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Examples */}
        <div className="card-theme-glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6 text-center">
            Input Examples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {textFieldExamples.map((inputData) => (
              <UITextField
                key={inputData.id}
                data={{
                  ...inputData,
                  value: inputValues[inputData.id] ?? inputData.value,
                }}
                onChange={handleInputStateChange}
                showLabel={true}
                {...getInputIcons(inputData.id)}
              />
            ))}
          </div>

          {/* Input Variant Examples */}
          <div className="mt-8 pt-6 border-t border-theme-tertiary">
            <h3 className="text-lg font-semibold text-theme-primary mb-4 text-center">
              Different Input Styles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UITextField
                data={{
                  id: "demo-primary",
                  variant: "primary",
                  type: "text",
                  placeholder: "Primary style",
                  label: "Primary",
                }}
                onChange={handleInputStateChange}
                showLabel={true}
              />
              <UITextField
                data={{
                  id: "demo-glass",
                  variant: "glass",
                  type: "text",
                  placeholder: "Glass style",
                  label: "Glass",
                }}
                onChange={handleInputStateChange}
                showLabel={true}
              />
              <UITextField
                data={{
                  id: "demo-outline",
                  variant: "outline",
                  type: "text",
                  placeholder: "Outline style",
                  label: "Outline",
                }}
                onChange={handleInputStateChange}
                showLabel={true}
              />
            </div>
          </div>
        </div>

        {/* Toggle Examples */}
        <div className="card-theme-glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6 text-center">
            Toggle & Switch Examples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toggleExamples.map((toggleData) => (
              <UIToggle
                key={toggleData.id}
                data={{
                  ...toggleData,
                  checked: toggleStates[toggleData.id] ?? toggleData.checked,
                }}
                onChange={handleToggleStateChange}
                showLabel={true}
                {...getToggleIcons(toggleData.id)}
              />
            ))}
          </div>

          {/* Toggle Size Examples */}
          <div className="mt-8 pt-6 border-t border-theme-tertiary">
            <h3 className="text-lg font-semibold text-theme-primary mb-4 text-center">
              Different Sizes
            </h3>
            <div className="flex flex-wrap gap-6 justify-center items-center">
              <UIToggle
                data={{
                  id: "toggle-small-demo",
                  label: "Small",
                  checked: toggleStates["toggle-small-demo"] ?? true,
                  variant: "primary",
                  size: "small",
                }}
                onChange={handleToggleStateChange}
                showLabel={true}
              />
              <UIToggle
                data={{
                  id: "toggle-medium-demo",
                  label: "Medium",
                  checked: toggleStates["toggle-medium-demo"] ?? true,
                  variant: "success",
                  size: "medium",
                }}
                onChange={handleToggleStateChange}
                showLabel={true}
              />
              <UIToggle
                data={{
                  id: "toggle-large-demo",
                  label: "Large",
                  checked: toggleStates["toggle-large-demo"] ?? true,
                  variant: "custom",
                  size: "large",
                }}
                onChange={handleToggleStateChange}
                showLabel={true}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Content;
