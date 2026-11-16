package com.aireview.api.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ReviewRequest {

    @NotBlank(message = "input is required")
    private String input;

    @Pattern(regexp = "diff|github_pr", message = "inputType must be 'diff' or 'github_pr'")
    private String inputType = "diff";

    public ReviewRequest() {}

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }

    public String getInputType() { return inputType; }
    public void setInputType(String inputType) { this.inputType = inputType; }
}
