"use client";

import { useState } from "react";
import { Plus, Trash2, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomField, CustomFieldType } from "@/types/models";

interface DynamicFieldsBuilderProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

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
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <ListPlus className="w-4 h-4 text-indigo-400" />
            Registration Form Custom Fields (JSONB)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Add dynamic attendee questions saved directly into the event schema
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {fields.length} {fields.length === 1 ? "field" : "fields"} configured
        </span>
      </div>

      {/* Existing Fields List */}
      {fields.length > 0 ? (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 w-5">#{index + 1}</span>
                <div>
                  <span className="text-sm font-medium text-slate-200">{field.label}</span>
                  {field.required && (
                    <span className="ml-2 text-[10px] text-rose-400 font-semibold uppercase">
                      Required
                    </span>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[11px] font-mono">
                      {field.type}
                    </span>
                    {field.options && (
                      <span className="text-slate-400 truncate max-w-xs">
                        Options: {field.options.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveField(index)}
                className="text-slate-400 hover:text-rose-400"
                title="Remove field"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
          No custom fields added yet. Default registration will collect Attendee Name & Email.
        </div>
      )}

      {/* Add New Field Inputs */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-5">
          <Input
            placeholder="Field Label (e.g. Dietary Needs, T-Shirt)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as CustomFieldType)}
            className="flex h-9 w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="text">Text Input</option>
            <option value="select">Select Dropdown</option>
            <option value="textarea">Textarea (Long)</option>
            <option value="number">Number</option>
            <option value="checkbox">Checkbox (Yes/No)</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center h-9">
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
            />
            Required
          </label>
        </div>

        <div className="sm:col-span-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleAddField}
            disabled={!newLabel.trim()}
            className="w-full h-9 text-xs gap-1 border-indigo-500/30 text-indigo-300 hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Field
          </Button>
        </div>

        {newType === "select" && (
          <div className="sm:col-span-12">
            <Input
              placeholder="Comma-separated options (e.g. S, M, L, XL)"
              value={optionsInput}
              onChange={(e) => setOptionsInput(e.target.value)}
              className="h-8 text-xs"
              helperText="Provide choices separated by commas"
            />
          </div>
        )}
      </div>
    </div>
  );
}
