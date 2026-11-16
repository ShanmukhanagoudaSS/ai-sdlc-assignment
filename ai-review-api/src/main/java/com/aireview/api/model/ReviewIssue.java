package com.aireview.api.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReviewIssue {
    private IssueCategory category;
    private Severity severity;
    private String title;
    private String description;
    private String file;
    private Integer line;
    private String suggestion;

    public ReviewIssue() {}

    public IssueCategory getCategory() { return category; }
    public void setCategory(IssueCategory category) { this.category = category; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFile() { return file; }
    public void setFile(String file) { this.file = file; }

    public Integer getLine() { return line; }
    public void setLine(Integer line) { this.line = line; }

    public String getSuggestion() { return suggestion; }
    public void setSuggestion(String suggestion) { this.suggestion = suggestion; }
}
