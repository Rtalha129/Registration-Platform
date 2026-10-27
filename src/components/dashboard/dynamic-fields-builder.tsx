"use client";

import { useState } from "react";
import { Plus, Trash2, HelpCircle, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomField, CustomFieldType } from "@/types/models";

interface DynamicFieldsBuilderProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

const FIELD_TYPE_LABELS: Record<CustomFieldType, { label: string; hint: string }> = {
  text: { label: "Short Answer", hint: "A single line of text (e.g., Company, Role, Handle)" },
  select: { label: "Multiple Choice", hint: "A curated list of options for the guest to pick from" },
  textarea: { label: "Long Response", hint: "A multi-line text box (e.g., Project notes, Dietary specifics)" },
  number: { label: "Numerical Count", hint: "A number (e.g., Guests in party, Years attending)" },
  checkbox: { label: "Yes / No Toggle", hint: "A simple confirmation checkbox" },
};

export function DynamicFieldsBuilder({ fields, onChange }: DynamicFieldsBuilderProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<CustomFieldType>("text");
  const [isRequired, setIsRequired] = useState(false);
  const [optionsInput, setOptionsInput] = useState("");

  const handleAddField = () => {
    if (!newLabel.trim()) return;

    const id = newLabel
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 32);

    const options =
      newType === "select"
        ? optionsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const newField: CustomField = {
      id: `${id}_${Date.now().toString(36)}`,
      label: newLabel.trim(),
      type: newType,
      required: isRequired,
      options: options && options.length > 0 ? options : undefined,
    };

    onChange([...fields, newField]);
    setNewLabel("");
    setIsRequired(false);
    setOptionsInput("");
  };

  const handleRemoveField = (indexToRemove: number) => {
    onChange(fields.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="editorial-card p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase">
              Section 03 · Registration Ledger
            </span>
          </div>
          <h4 className="font-serif text-lg text-[#f4f3ef] font-normal tracking-tight mt-0.5">
            Guest Inquiries & Custom Questions
          </h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Ask specific questions during RSVP (dietary requirements, studio affiliation, portfolio links). Stored securely with each guest’s entry record.
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-zinc-400 self-start sm:self-center">
          {fields.length} {fields.length === 1 ? "question" : "questions"} active
        </span>
      </div>

      {/* Existing Questions List */}
      {fields.length > 0 ? (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="tactile-panel p-4 flex items-start justify-between gap-4 group hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-[#e07a5f]">
                      № {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-[#f4f3ef] tracking-tight">
                      {field.label}
                    </span>
                    {field.required ? (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#e07a5f]/15 text-[#e07a5f] border border-[#e07a5f]/25">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500">
                        Optional
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 pt-0.5">
                    <span className="font-mono text-[11px] text-zinc-400">
                      Format: {FIELD_TYPE_LABELS[field.type]?.label || field.type}
                    </span>
                    {field.options && field.options.length > 0 && (
                      <>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-400 text-[11px] truncate max-w-sm">
                          Choices: {field.options.join(" / ")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                className="text-zinc-500 hover:text-[#e07a5f] p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                title="Remove this question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01]">
          <HelpCircle className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs text-zinc-400 font-serif italic text-base">
            No custom inquiries added yet.
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
            Your form will collect the standard essentials: Guest Full Name & Confirmation Email Address.
          </p>
        </div>
      )}

      {/* Add New Question Section */}
      <div className="pt-4 border-t border-white/[0.06] space-y-4">
        <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
          + Add another inquiry for your attendees
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Question Title / Prompt
            </label>
            <Input
              placeholder="e.g. Dietary preferences, Studio or Company, T-shirt size"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Answer Format
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as CustomFieldType)}
              className="flex h-10 w-full rounded-lg border border-white/[0.08] bg-[#14151a] px-3 py-2 text-xs text-[#f4f3ef] focus:outline-none focus:border-[#e07a5f] transition-colors"
            >
              <option value="text">Short Answer (One line)</option>
              <option value="select">Multiple Choice (Dropdown)</option>
              <option value="textarea">Long Note (Multi-line paragraph)</option>
              <option value="number">Numeric Count</option>
              <option value="checkbox">Yes / No Confirmation</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center justify-between sm:justify-start gap-3 h-10">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-[#e07a5f] focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-xs text-zinc-400">Mandatory</span>
            </label>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddField}
              disabled={!newLabel.trim()}
              className="h-9 text-xs gap-1.5 ml-auto sm:ml-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#e07a5f]" />
              Add Question
            </Button>
          </div>

          {newType === "select" && (
            <div className="sm:col-span-12 pt-1">
              <Input
                placeholder="Comma-separated choices (e.g. Omnivore, Vegetarian, Vegan, Gluten-free)"
                value={optionsInput}
                onChange={(e) => setOptionsInput(e.target.value)}
                className="h-9 text-xs font-mono"
                helperText="Separate each choice with a comma. Guests will select one."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

