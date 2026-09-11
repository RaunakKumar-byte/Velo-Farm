import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BotRoutingModule } from './bot-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { FieldOverview } from './field-overview/field-overview';
import { BotControl } from './bot-control/bot-control';
import { PlantDetails } from './plant-details/plant-details';
import { Analytics } from './analytics/analytics';
import { Logs } from './logs/logs';
import { Settings } from './settings/settings';
import { HelpSupport } from './help-support/help-support';
import { About } from './about/about';
import { SharedModule } from "../shared/shared-module";

@NgModule({
  declarations: [
    Dashboard,
    FieldOverview,
    BotControl,
    PlantDetails,
    Analytics,
    Logs,
    Settings,
    HelpSupport,
    About,
  ],
  imports: [
    CommonModule,
    BotRoutingModule,
    FormsModule,
    SharedModule,
  ]
})
export class BotModule { }
