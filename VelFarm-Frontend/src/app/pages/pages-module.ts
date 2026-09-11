import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PagesRoutingModule } from './pages-routing-module';
import { Home } from './home/home';
import { Dashboard } from './dashboard/dashboard';
import { Health } from './health/health';
import { Sprayer } from './sprayer/sprayer';
import { Analytics } from './analytics/analytics';
import { Setting } from './setting/setting';
import { Users } from './users/users';
import { Profile } from './profile/profile';
import { Features } from './features/features';
import { Contact } from './contact/contact';
import { About } from './about/about';
import { SharedModule } from '../shared/shared-module';
import { FieldLayoutComponent } from './field-layout.component/field-layout.component';
import { FieldLayoutDemoComponent } from './field-layout-demo/field-layout-demo';
import { UserProfileComponent } from './user-profile/user-profile';
import { NotificationsComponent } from './notifications/notifications';
import { CropCycleComponent } from './crop-cycle/crop-cycle';
import { Weather } from './weather/weather';
import { GoogleMap } from './google-map/google-map';
import { Devices } from './devices/devices';
import { Fields } from './fields/fields';
import { Crops } from './crops/crops';
import { Jobs } from './jobs/jobs';
import { HealthReports } from './health-reports/health-reports';
import { Activities } from './activities/activities';
import { WeatherCache } from './weather-cache/weather-cache';
import { DiseaseDetectionComponent } from './disease-detection/disease-detection';
import { CropDetail } from './crop-detail/crop-detail';
import { FieldDetail } from './field-detail/field-detail';
import { JobDetail } from './job-detail/job-detail';


@NgModule({
  declarations: [
    Home,
    Dashboard,
    Health,
    Sprayer,
    Analytics,
    Setting,
    Users,
    Profile,
    Features,
    Contact,
    About,
    FieldLayoutComponent,
    FieldLayoutDemoComponent,
    UserProfileComponent,
    NotificationsComponent,
    CropCycleComponent,
    Weather,
    GoogleMap,
    Devices,
    Fields,
    Crops,
    Jobs,
    HealthReports,
    Activities,
    WeatherCache,
    DiseaseDetectionComponent,
    CropDetail,
    FieldDetail,
    JobDetail
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PagesRoutingModule,
    SharedModule
  ]
})
export class PagesModule { }
