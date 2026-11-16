package com.aireview.api.model;

public class GateResult {
    private GateVerdict verdict;
    private String reason;
    private int criticalCount;
    private int highCount;
    private int mediumCount;
    private int lowCount;

    public GateResult() {}

    public GateVerdict getVerdict() { return verdict; }
    public void setVerdict(GateVerdict verdict) { this.verdict = verdict; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public int getCriticalCount() { return criticalCount; }
    public void setCriticalCount(int criticalCount) { this.criticalCount = criticalCount; }

    public int getHighCount() { return highCount; }
    public void setHighCount(int highCount) { this.highCount = highCount; }

    public int getMediumCount() { return mediumCount; }
    public void setMediumCount(int mediumCount) { this.mediumCount = mediumCount; }

    public int getLowCount() { return lowCount; }
    public void setLowCount(int lowCount) { this.lowCount = lowCount; }
}
