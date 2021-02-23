import {Inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {DOCUMENT} from '@angular/common';

interface Scripts {
  name: string;
  src: string;
}

export const ScriptStore: Scripts[] = [
  {
    name: 'cadex-bundle',
    src: `./assets/js/cadex.bundle.js`
  },
  {
    name: 'jstree',
    src: `https://cdn.jsdelivr.net/npm/jstree/dist/jstree.min.js`
  },
  {
    name: 'jquery',
    src: `https://code.jquery.com/jquery-3.5.1.min.js`
  }
];

@Injectable()
export class DynamicScriptLoaderService {

  private scripts: any = {};
  private renderer: Renderer2;

  constructor(@Inject(DOCUMENT) private document: Document,
              rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
  }

  load(...scripts: string[]): Promise<any[]> {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadScript(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.scripts[name].loaded) {
        // load script
        const script = this.renderer.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        script.async = true;
        script.defer = true;
        if (script.readyState) {  // IE
          script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({script: name, loaded: true, status: 'Loaded'});
            }
          };
        } else {  // Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({script: name, loaded: true, status: 'Loaded'});
          };
        }
        script.onerror = () => reject({script: name, loaded: false, status: 'Not Loaded'});

        this.renderer.appendChild(this.document.body, script);
      } else {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
    });
  }
}
