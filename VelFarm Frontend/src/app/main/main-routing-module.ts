import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from '../pages/dashboard/dashboard';
import { ControlPanelComponent } from './control-panel/control-panel';

const routes: Routes = [
  {
      path: '',
      component: Dashboard
    },
    {
      path: 'control-panel',
      component: ControlPanelComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { 

}
