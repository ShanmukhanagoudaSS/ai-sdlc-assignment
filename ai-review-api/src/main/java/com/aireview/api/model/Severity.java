package com.aireview.api.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Severity {
    CRITICAL("Critical"),
    HIGH("High"),
    MEDIUM("Medium"),
    LOW("Low");

    private final String label;

    Severity(String label) { this.label = label; }

    @JsonValue
    public String getLabel() { return label; }

    public static Severity fromLabel(String label) {
        for (Severity s : values()) {
            if (s.label.equalsIgnoreCase(label)) return s;
        }
        throw new IllegalArgumentException("Unknown severity: " + label);
    }
}
