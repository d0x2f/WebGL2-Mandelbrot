"use strict";

import { Object } from './object.js';

/**
 * Represents a collection of renderable objects.
 */
export class Mesh extends Object {
  constructor(gl, objects) {
    super(gl);
    this.objects = objects;
  }

  add_object(object) {
    this.objects.push(object);
  }

  /**
   * Render each object in the mesh.
   *
   * @param {Matrix} model Model matrix for this context.
   */
  render(model) {
    model = model.multiply(this.transform);
    this.objects.forEach((object) => object.render(model));
  }
}