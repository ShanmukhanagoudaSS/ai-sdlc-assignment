package com.aireview.api.model;

import java.util.List;

public class ReviewResult {
    private String summary;
    private List<ReviewIssue> issues;
    private String reviewedAt;
    private String model;
    private DiffStats diffStats;

    public ReviewResult() {}

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<ReviewIssue> getIssues() { return issues; }
    public void setIssues(List<ReviewIssue> issues) { this.issues = issues; }

    public String getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(String reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public DiffStats getDiffStats() { return diffStats; }
    public void setDiffStats(DiffStats diffStats) { this.diffStats = diffStats; }

    public static class DiffStats {
        private int filesChanged;
        private int linesAdded;
        private int linesRemoved;

        public DiffStats() {}
        public DiffStats(int filesChanged, int linesAdded, int linesRemoved) {
            this.filesChanged = filesChanged;
            this.linesAdded = linesAdded;
            this.linesRemoved = linesRemoved;
        }

        public int getFilesChanged() { return filesChanged; }
        public void setFilesChanged(int filesChanged) { this.filesChanged = filesChanged; }

        public int getLinesAdded() { return linesAdded; }
        public void setLinesAdded(int linesAdded) { this.linesAdded = linesAdded; }

        public int getLinesRemoved() { return linesRemoved; }
        public void setLinesRemoved(int linesRemoved) { this.linesRemoved = linesRemoved; }
    }
}
