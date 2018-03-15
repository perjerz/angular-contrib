import { Directive, ElementRef, Renderer2, RendererStyleFlags2 } from '@angular/core';

const NG_HOST_ELEMENTS = '__ng_host_elements__';

@Directive({
  selector: 'ng-host',
})
export class NgHost {
  constructor(element: ElementRef, renderer: Renderer2) {
    transferInitialAttributes(renderer, element.nativeElement);

    if (!renderer[NG_HOST_ELEMENTS]) {
      renderer[NG_HOST_ELEMENTS] = new WeakSet<Element>();
      interceptRenderer(renderer);
    }

    renderer[NG_HOST_ELEMENTS].add(element.nativeElement);
  }
}

function transferInitialAttributes(renderer: Renderer2, element: HTMLElement) {
  const parent = renderer.parentNode(element);

  for (let i = 0; i < element.classList.length; i++) {
    const className = element.classList[i];
    renderer.addClass(parent, className);
  }
  renderer.removeAttribute(element, 'class');

  for (let i = 0; i < element.style.length; i++) {
    const style = element.style[i];
    const value = element.style[style];
    renderer.setStyle(parent, style, value);
  }
  renderer.removeAttribute(element, 'style');

  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    renderer.setAttribute(parent, attr.name, attr.value);
    renderer.removeAttribute(element, attr.name);
  }
}

function interceptRenderer(renderer: Renderer2): void {
  const addClass = renderer.addClass;
  const listen = renderer.listen;
  const removeAttribute = renderer.removeAttribute;
  const removeClass = renderer.removeClass;
  const removeStyle = renderer.removeStyle;
  const setAttribute = renderer.setAttribute;
  const setProperty = renderer.setProperty;
  const setStyle = renderer.setStyle;

  renderer.addClass = function (el: any, name: string): void {
    addClass.call(this, targetOf(this, el), name);
  };

  renderer.listen = function (target: 'window' | 'document' | 'body' | any, eventName: string, callback: (event: any) => boolean | void): () => void {
    return listen.call(this, targetOf(this, target), eventName, callback);
  };

  renderer.removeAttribute = function (el: any, name: string, namespace?: string | null): void {
    removeAttribute.call(this, targetOf(this, el), name, namespace);
  };

  renderer.removeClass = function (el: any, name: string): void {
    removeClass.call(this, targetOf(this, el), name);
  };

  renderer.removeStyle = function (el: any, style: string, flags?: RendererStyleFlags2): void {
    removeStyle.call(this, targetOf(this, el), style, flags);
  };

  renderer.setAttribute = function (el: any, name: string, value: string, namespace?: string | null): void {
    setAttribute.call(this, targetOf(this, el), name, value, namespace);
  };

  renderer.setProperty = function (el: any, name: string, value: any): void {
    setProperty.call(this, targetOf(this, el), name, value);
  };

  renderer.setStyle = function (el: any, style: string, value: any, flags?: RendererStyleFlags2): void {
    setStyle.call(this, targetOf(this, el), style, value, flags);
  };
}

function targetOf(renderer: Renderer2, node: string | any): any {
  if (typeof node !== 'string' &&
      renderer[NG_HOST_ELEMENTS] instanceof WeakSet &&
      renderer[NG_HOST_ELEMENTS].has(node)) {
    return renderer.parentNode(node);
  }
  return node;
}
