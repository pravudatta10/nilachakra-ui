import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'; 
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
	{ path: '', component: ChatComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'chat', component: ChatComponent }, 
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule]
})
export class FeaturesRoutingModule {}
