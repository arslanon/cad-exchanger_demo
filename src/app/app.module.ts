import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {DynamicScriptLoaderService} from './shared/services/dynamic-script-loader.service';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MainComponent } from './views/main/main.component';
import {NgApexchartsModule} from 'ng-apexcharts';
import {MatListModule} from '@angular/material/list';
import {ApiService} from './shared/services/api.service';
import {TreeviewService} from './shared/services/treeview.service';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,

    MatInputModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatListModule,

    NgApexchartsModule
  ],
  exports: [
    MatInputModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatListModule
  ],
  providers: [
    DynamicScriptLoaderService,
    ApiService,
    TreeviewService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
