import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController, Platform } from '@ionic/angular';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { map,catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
 

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private baseUrl = 'http://backend.project2.local/api';
  authState = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: Storage,
    private platform: Platform,
    public toastController: ToastController
  ) { 
    this.platform.ready().then(() => {
      this.ifLoggedIn();
    });
  }
  ifLoggedIn() {
    this.storage.get('USER_INFO').then((response) => {
      if (response) {
        this.authState.next(true);
      }
    });
  }
  getUser() {
    return this.storage.get('USER_INFO').then(result => result);
  }
  login(username, password):Observable<any> { 
    const httpOptions = {headers: new HttpHeaders({})};
    const form = new FormData();
    form.append('username', username);
    form.append('password', password);
    return this.http.post(`${this.baseUrl}/login`, form, httpOptions).pipe(
      map(results => {
        if(results['success'] === true) {
          this.storage.set('start_score',results['data']['start_score']);
          this.storage.set('end_score',results['data']['end_score']);

          this.storage.set('USER_INFO', JSON.stringify(results['data'])).then((response) => { 
            this.authState.next(true);
          });
        }
        return results;
      }),
      catchError(this.handleError)
    ); 

  }

  logout() {
    this.storage.remove('USER_INFO').then(() => {
      this.router.navigate(['login']);
      this.authState.next(false);
    });
  }
 
  isAuthenticated() {
    console.info('authState', this.authState.value);
    return this.authState.value;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

}
