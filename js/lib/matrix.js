"use strict";

import { Vector } from './vector.js';

export class Matrix {

  /**
   * Construct from the given row vectors.
   *
   * @param {Vector} r1
   * @param {Vector} r2
   * @param {Vector} r3
   * @param {Vector} r4
   */
  constructor(r1, r2, r3, r4) {
    this.r1 = r1;
    this.r2 = r2;
    this.r3 = r3
    this.r4 = r4;
  }

  /**
   * Compute the transpose of this matrix.
   *
   * @return {Matrix}
   */
  transpose() {
    const r1 = this.r1;
    const r2 = this.r2;
    const r3 = this.r3;
    const r4 = this.r4;
    return new Matrix(
      new Vector(r1.x, r2.x, r3.x, r4.x),
      new Vector(r1.y, r2.y, r3.y, r4.y),
      new Vector(r1.z, r2.z, r3.z, r4.z),
      new Vector(r1.w, r2.w, r3.w, r4.w),
    );
  }

  /**
   * Compute the inverse of this matrix.
   *
   * @return {Matrix}
   */
  inverse() {
    const r1 = this.r1;
    const r2 = this.r2;
    const r3 = this.r3;
    const r4 = this.r4;
    const inverse = Matrix.identity();

    inverse.r1.x = r2.y * r3.z * r4.w -
      r2.y * r4.z * r3.w -
      r2.z * r3.y * r4.w +
      r2.z * r4.y * r3.w +
      r2.w * r3.y * r4.z -
      r2.w * r4.y * r3.z;

    inverse.r1.y = -r1.y * r3.z * r4.w +
      r1.y * r4.z * r3.w +
      r1.z * r3.y * r4.w -
      r1.z * r4.y * r3.w -
      r1.w * r3.y * r4.z +
      r1.w * r4.y * r3.z;

    inverse.r1.z = r1.y * r2.z * r4.w -
      r1.y * r4.z * r2.w -
      r1.z * r2.y * r4.w +
      r1.z * r4.y * r2.w +
      r1.w * r2.y * r4.z -
      r1.w * r4.y * r2.z;

    inverse.r1.w = -r1.y * r2.z * r3.w +
      r1.y * r3.z * r2.w +
      r1.z * r2.y * r3.w -
      r1.z * r3.y * r2.w -
      r1.w * r2.y * r3.z +
      r1.w * r3.y * r2.z;

    inverse.r2.x = -r2.x * r3.z * r4.w +
      r2.x * r4.z * r3.w +
      r2.z * r3.x * r4.w -
      r2.z * r4.x * r3.w -
      r2.w * r3.x * r4.z +
      r2.w * r4.x * r3.z;

    inverse.r2.y = r1.x * r3.z * r4.w -
      r1.x * r4.z * r3.w -
      r1.z * r3.x * r4.w +
      r1.z * r4.x * r3.w +
      r1.w * r3.x * r4.z -
      r1.w * r4.x * r3.z;

    inverse.r2.z = -r1.x * r2.z * r4.w +
      r1.x * r4.z * r2.w +
      r1.z * r2.x * r4.w -
      r1.z * r4.x * r2.w -
      r1.w * r2.x * r4.z +
      r1.w * r4.x * r2.z;

    inverse.r2.w = r1.x * r2.z * r3.w -
      r1.x * r3.z * r2.w -
      r1.z * r2.x * r3.w +
      r1.z * r3.x * r2.w +
      r1.w * r2.x * r3.z -
      r1.w * r3.x * r2.z;

    inverse.r3.x = r2.x * r3.y * r4.w -
      r2.x * r4.y * r3.w -
      r2.y * r3.x * r4.w +
      r2.y * r4.x * r3.w +
      r2.w * r3.x * r4.y -
      r2.w * r4.x * r3.y;

    inverse.r3.y = -r1.x * r3.y * r4.w +
      r1.x * r4.y * r3.w +
      r1.y * r3.x * r4.w -
      r1.y * r4.x * r3.w -
      r1.w * r3.x * r4.y +
      r1.w * r4.x * r3.y;

    inverse.r3.z = r1.x * r2.y * r4.w -
      r1.x * r4.y * r2.w -
      r1.y * r2.x * r4.w +
      r1.y * r4.x * r2.w +
      r1.w * r2.x * r4.y -
      r1.w * r4.x * r2.y;

    inverse.r3.w = -r1.x * r2.y * r3.w +
      r1.x * r3.y * r2.w +
      r1.y * r2.x * r3.w -
      r1.y * r3.x * r2.w -
      r1.w * r2.x * r3.y +
      r1.w * r3.x * r2.y;

    inverse.r4.x = -r2.x * r3.y * r4.z +
      r2.x * r4.y * r3.z +
      r2.y * r3.x * r4.z -
      r2.y * r4.x * r3.z -
      r2.z * r3.x * r4.y +
      r2.z * r4.x * r3.y;

    inverse.r4.y = r1.x * r3.y * r4.z -
      r1.x * r4.y * r3.z -
      r1.y * r3.x * r4.z +
      r1.y * r4.x * r3.z +
      r1.z * r3.x * r4.y -
      r1.z * r4.x * r3.y;

    inverse.r4.z = -r1.x * r2.y * r4.z +
      r1.x * r4.y * r2.z +
      r1.y * r2.x * r4.z -
      r1.y * r4.x * r2.z -
      r1.z * r2.x * r4.y +
      r1.z * r4.x * r2.y;

    inverse.r4.w = r1.x * r2.y * r3.z -
      r1.x * r3.y * r2.z -
      r1.y * r2.x * r3.z +
      r1.y * r3.x * r2.z +
      r1.z * r2.x * r3.y -
      r1.z * r3.x * r2.y;

    let det = r1.x * inverse.r1.x + r2.x * inverse.r1.y + r3.x * inverse.r1.z + r4.x * inverse.r1.w;

    if (det === 0) {
      throw 'unable to compute matrix inverse (det = inf).';
    }

    return inverse.multiply_scalar(1 / det);
  }

  /**
   * Multiply this matrix by another.
   *
   * @param {Matrix}
   *
   * @return {Matrix}
   */
  multiply(operand) {
    const r1 = this.r1;
    const r2 = this.r2;
    const r3 = this.r3;
    const r4 = this.r4;
    const b = operand.transpose();
    return new Matrix(
      new Vector(r1.dot(b.r1), r1.dot(b.r2), r1.dot(b.r3), r1.dot(b.r4)),
      new Vector(r2.dot(b.r1), r2.dot(b.r2), r2.dot(b.r3), r2.dot(b.r4)),
      new Vector(r3.dot(b.r1), r3.dot(b.r2), r3.dot(b.r3), r3.dot(b.r4)),
      new Vector(r4.dot(b.r1), r4.dot(b.r2), r4.dot(b.r3), r4.dot(b.r4)),
    );
  }

  /**
   * Multiply this matrix by a vector.
   *
   * @param {Vector}
   *
   * @return {Vector}
   */
  multiply_vector(v) {
    return new Vector(
      v.dot(this.r1),
      v.dot(this.r2),
      v.dot(this.r3),
      v.dot(this.r4)
    );
  }

  /**
   * Multiply this matrix by a scalar.
   *
   * @param {float}
   *
   * @return {Matrix}
   */
  multiply_scalar(operand) {
    return new Matrix(
      this.r1.multiply(operand),
      this.r2.multiply(operand),
      this.r3.multiply(operand),
      this.r4.multiply(operand)
    );
  }

  /**
   * Perform a scale transform.
   *
   * @param {float} x
   * @param {float} y
   * @param {float} z
   *
   * @return {Matrix}
   */
  scale(x, y, z) {
    return new Matrix(
      new Vector(x, 0, 0, 0),
      new Vector(0, y, 0, 0),
      new Vector(0, 0, z, 0),
      new Vector(0, 0, 0, 1),
    ).multiply(this);
  }

  /**
   * Perform a translation transform.
   *
   * @param {float} x
   * @param {float} y
   * @param {float} z
   *
   * @return {Matrix}
   */
  translate(x, y, z) {
    return new Matrix(
      new Vector(1, 0, 0, x),
      new Vector(0, 1, 0, y),
      new Vector(0, 0, 1, z),
      new Vector(0, 0, 0, 1),
    ).multiply(this);
  }

  /**
   * Return the matrix as an array of floats.
   *
   * @return {Float32Array}
   */
  as_float_array() {
    const r1 = this.r1;
    const r2 = this.r2;
    const r3 = this.r3;
    const r4 = this.r4;
    return new Float32Array([
      r1.x, r1.y, r1.z, r1.w,
      r2.x, r2.y, r2.z, r2.w,
      r3.x, r3.y, r3.z, r3.w,
      r4.x, r4.y, r4.z, r4.w,
    ])
  }

  /**
   * Return the identity matrix.
   *
   * @return {Matrix}
   */
  static identity() {
    return new Matrix(
      new Vector(1, 0, 0, 0),
      new Vector(0, 1, 0, 0),
      new Vector(0, 0, 1, 0),
      new Vector(0, 0, 0, 1)
    );
  }
}