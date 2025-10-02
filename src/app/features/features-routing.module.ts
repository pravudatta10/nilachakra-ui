import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'; 
import { LoginComponent } from './login/login.component';

const routes: Routes = [
	{ path: '', component: LoginComponent },
	// Add more feature routes here
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class FeaturesRoutingModule {}
