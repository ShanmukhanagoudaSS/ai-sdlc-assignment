import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReviewRequest, ReviewResponse } from '../models/review.models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly endpoint = `${environment.apiBaseUrl}/review`;

  constructor(private http: HttpClient) {}

  submit(request: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.endpoint, request);
  }
}
