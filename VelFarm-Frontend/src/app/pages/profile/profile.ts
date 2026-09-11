import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,FormControl  } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  profileForm: FormGroup = new FormGroup({});
  isLoading = false;
  errorMessage = '';

  // State variables for managing editable sections
  isUserDetailsEditing = false;
  isFarmInfoEditing = false;
  isCropInfoEditing = false;
  isEquipmentInfoEditing = false;
  isPesticideFertilizerEditing = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService
  ) {
    this.profileForm = this.fb.group({
      userDetails: this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        communication: ['Email', Validators.required],
        language: ['English', Validators.required],
        farmingExperience: ['', Validators.required],
      }),
      farmInfo: this.fb.group({
        farmName: ['', Validators.required],
        farmLocation: ['', Validators.required],
        farmSize: [null, Validators.required],
      }),
      cropInfo: this.fb.group({
        primaryCrops: ['', Validators.required],
        secondaryCrops: [''],
      }),
      equipmentInfo: this.fb.group({
        sprayerType: ['', Validators.required],
        iotDevices: [null, Validators.required],
        machinery: ['', Validators.required],
      }),
      pesticideFertilizer: this.fb.group({
        pesticides: ['', Validators.required],
        fertilizerPreference: ['', Validators.required],
        monthlyExpenditure: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userData = this.authService.getCurrentUser(); // Placeholder
    if (userData) {
      this.profileForm.patchValue({
        userDetails: {
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          farmingExperience: userData.farmingExperience,
          communication: userData.communication,
          language: userData.language
        },
        farmInfo: {
          farmName: userData.farmName,
          farmLocation: userData.farmLocation,
          farmSize: userData.farmSize
        },
        cropInfo: {
          primaryCrops: userData.primaryCrops?.join(', ') || '',
          secondaryCrops: userData.secondaryCrops?.join(', ') || ''
        },
        equipmentInfo: {
          sprayerType: userData.sprayerType || '',
          iotDevices: userData.iotDevices || '',
          machinery: userData.machinery?.join(', ') || ''
        },
        pesticideFertilizer: {
          pesticides: userData.pesticides?.join(', ') || '',
          fertilizerPreference: userData.fertilizerPreference || '',
          monthlyExpenditure: userData.monthlyExpenditure || ''
        }
      });
    }
  }

  // Toggle methods
  toggleUserDetailsEdit() { this.isUserDetailsEditing = !this.isUserDetailsEditing; }
  toggleFarmInfoEdit() { this.isFarmInfoEditing = !this.isFarmInfoEditing; }
  toggleCropInfoEdit() { this.isCropInfoEditing = !this.isCropInfoEditing; }
  toggleEquipmentInfoEdit() { this.isEquipmentInfoEditing = !this.isEquipmentInfoEditing; }
  togglePesticideFertilizerEdit() { this.isPesticideFertilizerEditing = !this.isPesticideFertilizerEditing; }

  // Navigation
  onBack() {
    console.log('Navigating back...');
  }

  onSubmit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    let hasChanges = false;
    let isFormInvalid = false;
    const updatedData: any = { ...currentUser }; // Start with current user data

    // Process User Details
    const userDetailsGroup = this.profileForm.get('userDetails') as FormGroup;
    if (this.isUserDetailsEditing) {
      if (userDetailsGroup.invalid) {
        this.markFormGroupTouched(userDetailsGroup);
        isFormInvalid = true;
      } else {
        hasChanges = true;
        Object.assign(updatedData, userDetailsGroup.value);
      }
    }

    // Process Farm Details
    const farmInfoGroup = this.profileForm.get('farmInfo') as FormGroup;
    if (this.isFarmInfoEditing) {
      if (farmInfoGroup.invalid) {
        this.markFormGroupTouched(farmInfoGroup);
        isFormInvalid = true;
      } else {
        hasChanges = true;
        Object.assign(updatedData, farmInfoGroup.value);
      }
    }

    // Process Crop Info
    const cropInfoGroup = this.profileForm.get('cropInfo') as FormGroup;
    if (this.isCropInfoEditing) {
      if (cropInfoGroup.invalid) {
        this.markFormGroupTouched(cropInfoGroup);
        isFormInvalid = true;
      } else {
        hasChanges = true;
        updatedData.primaryCrops = cropInfoGroup.value.primaryCrops?.split(', ') || [];
        updatedData.secondaryCrops = cropInfoGroup.value.secondaryCrops?.split(', ') || [];
      }
    }

    // Process Equipment Info
    const equipmentInfoGroup = this.profileForm.get('equipmentInfo') as FormGroup;
    if (this.isEquipmentInfoEditing) {
      if (equipmentInfoGroup.invalid) {
        this.markFormGroupTouched(equipmentInfoGroup);
        isFormInvalid = true;
      } else {
        hasChanges = true;
        updatedData.sprayerType = equipmentInfoGroup.value.sprayerType;
        updatedData.iotDevices = equipmentInfoGroup.value.iotDevices;
        updatedData.machinery = equipmentInfoGroup.value.machinery?.split(', ') || [];
      }
    }

    // Process Pesticide & Fertilizer
    const pesticideFertilizerGroup = this.profileForm.get('pesticideFertilizer') as FormGroup;
    if (this.isPesticideFertilizerEditing) {
      if (pesticideFertilizerGroup.invalid) {
        this.markFormGroupTouched(pesticideFertilizerGroup);
        isFormInvalid = true;
      } else {
        hasChanges = true;
        updatedData.pesticides = pesticideFertilizerGroup.value.pesticides?.split(', ') || [];
        updatedData.fertilizerPreference = pesticideFertilizerGroup.value.fertilizerPreference;
        updatedData.monthlyExpenditure = pesticideFertilizerGroup.value.monthlyExpenditure;
      }
    }

    if (isFormInvalid) {
      this.toast.show('Please fill all required fields in the edited sections.', 'error');
      return;
    }

    if (!hasChanges) {
      this.toast.show('No changes to save.', 'info');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.updateProfile(updatedData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toast.show('Profile updated successfully!', 'success');
        this.profileForm.markAsPristine(); // Mark form as pristine after successful save
        // Reset editing states
        this.isUserDetailsEditing = false;
        this.isFarmInfoEditing = false;
        this.isCropInfoEditing = false;
        this.isEquipmentInfoEditing = false;
        this.isPesticideFertilizerEditing = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Profile update failed.';
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldError(groupName: string, fieldName: string): string {
    const group = this.profileForm.get(groupName) as FormGroup;
    const control = group?.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${fieldName} is required`;
      if (control.errors['email']) return 'Please enter a valid email address';
    }
    return '';
  }
  updateUserDetails() {
    const userDetailsGroup = this.profileForm.get('userDetails') as FormGroup;
    if (userDetailsGroup.valid) {
      this.updateProfilePartial(userDetailsGroup.value, () => this.isUserDetailsEditing = false);
    } else {
      this.markFormGroupTouched(userDetailsGroup);
      this.toast.show('Please fill all required fields in User Details section.', 'error');
    }
  }

  updateFarmInfo() {
    const farmInfoGroup = this.profileForm.get('farmInfo') as FormGroup;
    if (farmInfoGroup.valid) {
      this.updateProfilePartial(farmInfoGroup.value, () => this.isFarmInfoEditing = false);
    } else {
      this.markFormGroupTouched(farmInfoGroup);
      this.toast.show('Please fill all required fields in Farm Details section.', 'error');
    }
  }

  updateCropInfo() {
    const cropInfoGroup = this.profileForm.get('cropInfo') as FormGroup;
    if (cropInfoGroup.valid) {
      const sectionData = {
        primaryCrops: cropInfoGroup.value.primaryCrops?.split(', ') || [],
        secondaryCrops: cropInfoGroup.value.secondaryCrops?.split(', ') || []
      };
      this.updateProfilePartial(sectionData, () => this.isCropInfoEditing = false);
    } else {
      this.markFormGroupTouched(cropInfoGroup);
      this.toast.show('Please fill all required fields in Crop Information section.', 'error');
    }
  }

  updateEquipmentInfo() {
    const equipmentInfoGroup = this.profileForm.get('equipmentInfo') as FormGroup;
    if (equipmentInfoGroup.valid) {
      const sectionData = {
        sprayerType: equipmentInfoGroup.value.sprayerType,
        iotDevices: equipmentInfoGroup.value.iotDevices,
        machinery: equipmentInfoGroup.value.machinery?.split(', ') || []
      };
      this.updateProfilePartial(sectionData, () => this.isEquipmentInfoEditing = false);
    } else {
      this.markFormGroupTouched(equipmentInfoGroup);
      this.toast.show('Please fill all required fields in Equipment Information section.', 'error');
    }
  }

  updatePesticideFertilizer() {
    const pesticideFertilizerGroup = this.profileForm.get('pesticideFertilizer') as FormGroup;
    if (pesticideFertilizerGroup.valid) {
      const sectionData = {
        pesticides: pesticideFertilizerGroup.value.pesticides?.split(', ') || [],
        fertilizerPreference: pesticideFertilizerGroup.value.fertilizerPreference,
        monthlyExpenditure: pesticideFertilizerGroup.value.monthlyExpenditure
      };
      this.updateProfilePartial(sectionData, () => this.isPesticideFertilizerEditing = false);
    } else {
      this.markFormGroupTouched(pesticideFertilizerGroup);
      this.toast.show('Please fill all required fields in Pesticide & Fertilizer section.', 'error');
    }
  }

  onSectionSave(section: string) {
    switch (section) {
      case 'user':
        this.updateUserDetails();
        break;
      case 'farm':
        this.updateFarmInfo();
        break;
      case 'crop':
        this.updateCropInfo();
        break;
      case 'equipment':
        this.updateEquipmentInfo();
        break;
      case 'pesticideFertilizer':
        this.updatePesticideFertilizer();
        break;
      default:
        console.error('Unknown section:', section);
    }
  }

  private updateProfilePartial(sectionData: any, onSuccess: () => void) {
    if (!this.profileForm.dirty) {
      this.toast.show('No changes to save.', 'info');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'User not logged in.';
      this.isLoading = false;
      return;
    }

    // Merge the sectionData with the current user data to ensure a full update
    const updatedUserData = { ...currentUser, ...sectionData };

    this.authService.updateProfile(updatedUserData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toast.show('Section updated successfully!', 'success');
        this.profileForm.markAsPristine(); // Mark form as pristine after successful save
        onSuccess();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Section update failed.';
      }
    });
  }


}
