package com.aireview.api.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum GateVerdict {
    PASS("PASS"),
    PASS_WITH_REVIEW("PASS WITH REVIEW"),
    BLOCK("BLOCK");

    private final String label;

    GateVerdict(String label) { this.label = label; }

    @JsonValue
    public String getLabel() { return label; }
}
