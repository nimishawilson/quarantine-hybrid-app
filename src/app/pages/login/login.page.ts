import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth/auth.service';
import { LoginUserCred, LoginResponse } from '../../models/auth';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  loginAni: HTMLIonLoadingElement;
  userData: LoginUserCred;
  loginForm: FormGroup;
  showPasswordText: boolean; // To toggle password visibility
  passwordIcon: 'eye' | 'eye-off' = 'eye';
  pageClean: boolean; // Flag to check if no changes were made.
  loginSubs: Subscription;
  loginResponse: LoginResponse;
  constructor(
    private authService: AuthService,
    public alertController: AlertController,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.pageClean = true;
    this.showPasswordText = false;
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.email,
      ]),
      password: new FormControl('', [
        Validators.minLength(8),
        Validators.maxLength(30),
        Validators.required,
      ]),
    });
  }

  ngOnInit() {
    this.loginSubs = this.loginForm.valueChanges.subscribe((change) => {
      this.pageClean = false;
    });
  }

  ngOnDestroy() {
    this.loginSubs.unsubscribe();
  }

  loginUser() {
    // start the loading animation
    this.loadingService
      .presentLoadingWithOptions({
        duration: 0,
        message: `Checking credentials`,
      })
      .then((onLoadSuccess) => {
        this.loginAni = onLoadSuccess;
        this.loginAni.present();
        // call the login API
        const userCred: LoginUserCred = this.loginForm.value;
        this.authService
          .loginUser(userCred)
          .then((data: LoginResponse) => {
            this.loginAni.dismiss();
            this.loginResponse = data;
            this.router.navigate(['/quarantine-map']);
            console.log(this.loginResponse);
          })
          .catch((errorObj) => {
            this.loginAni.dismiss();
            const { error, status: statusCode } = errorObj;
            const errorMessages: string[] = [];
            for (const key in error) {
              if (error.hasOwnProperty(key) && typeof key !== 'function') {
                console.error(error[key][0]);
                errorMessages.push(error[key][0]);
              }
            }
            // show the errors as alert
            this.handleLoginErrors(errorMessages, statusCode);
          });
      })
      .catch((error) => alert(error));
  }

  togglePasswordVisibility() {
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
    if (this.passwordIcon === 'eye-off') {
      setTimeout(() => {
        this.passwordIcon = 'eye';
      }, 6000);
    }
  }

  handleLoginErrors(errorMessages: string[], statusCode) {
    console.log(...errorMessages, statusCode);
    this.presentAlert(...errorMessages);
  }

  async presentAlert(messages = 'Unknown error !') {
    const alert = await this.alertController.create({
      header: 'Error',
      subHeader: 'Login failed !',
      // message: `The following error occurred: ${messages} Please try again`,
      message: messages,
      buttons: ['Try again'],
    });

    await alert.present();
  }

  registerUser() {
    console.log('go to register page');
  }
}
