package com.aireview.api.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum IssueCategory {
    CORRECTNESS("Correctness"),
    SECURITY("Security"),
    CODE_SMELL("Code Smell"),
    MAINTAINABILITY("Maintainability"),
    MISSING_TESTS("Missing Tests"),
    DEPENDENCY("Dependency");

    private final String label;

    IssueCategory(String label) { this.label = label; }

    @JsonValue
    public String getLabel() { return label; }

    public static IssueCategory fromLabel(String label) {
        for (IssueCategory c : values()) {
            if (c.label.equalsIgnoreCase(label)) return c;
        }
        throw new IllegalArgumentException("Unknown category: " + label);
    }
}
