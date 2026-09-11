import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss']
})
export class Contact implements OnInit {
  contactForm: FormGroup = new FormGroup({});
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  pageTitle: string = 'Contact Us';
  pageSubtitle: string = "We'd love to hear from you! Please fill out the form below.";

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        if (Math.random() > 0.2) { // 80% success rate
          this.successMessage = 'Your message has been sent successfully!';
          this.contactForm.reset();
        } else {
          this.errorMessage = 'Failed to send message. Please try again later.';
        }
      }, 2000);
    } else {
      this.markFormGroupTouched(this.contactForm);
      this.errorMessage = 'Please fill in all required fields.';
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${fieldName} is required`;
      if (control.errors['email']) return 'Please enter a valid email address';
    }
    return '';
  }
}