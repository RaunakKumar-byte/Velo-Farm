import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing-module';

// Services
import { DeviceService } from '../services/device.service';
import { LogsService } from '../services/logs.service';
import { AISettingsService } from '../services/ai-settings.service';
import { AIModelService } from '../services/ai-model.service';
import { SharedModule } from '../shared/shared-module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MainRoutingModule,
    SharedModule
  ],
  providers: [
    DeviceService,
    LogsService,
    AISettingsService,
    AIModelService
  ]
})
export class MainModule { }
