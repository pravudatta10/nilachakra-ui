import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FeaturesRoutingModule } from './features-routing.module';



@NgModule({
  declarations: [], // No declarations needed for standalone components
  imports: [
    CommonModule,
    FeaturesRoutingModule
  ]
})
export class FeaturesModule { }
