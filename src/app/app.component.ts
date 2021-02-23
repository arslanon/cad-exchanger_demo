import {Component} from '@angular/core';
import {DynamicScriptLoaderService} from './shared/dynamic-script-loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  pageReady = false;

  constructor(private dynamicScriptLoaderService: DynamicScriptLoaderService) {
    this.dynamicScriptLoaderService.load('cadex-bundle').then(() => {
      this.pageReady = true;
    });
  }
}
