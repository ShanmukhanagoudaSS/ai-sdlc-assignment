package com.aireview.api.model;

public class ReviewResponse {
    private ReviewResult result;
    private GateResult gate;

    public ReviewResponse() {}

    public ReviewResponse(ReviewResult result, GateResult gate) {
        this.result = result;
        this.gate = gate;
    }

    public ReviewResult getResult() { return result; }
    public void setResult(ReviewResult result) { this.result = result; }

    public GateResult getGate() { return gate; }
    public void setGate(GateResult gate) { this.gate = gate; }
}
