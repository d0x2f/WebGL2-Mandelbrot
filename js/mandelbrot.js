"use strict";

import { GL } from './lib/gl.js';
import { Vector } from './lib/vector.js';

/**
 * Class representing the madelbrot animation.
 */
export class Mandelbrot {

  constructor(canvas) {
    this.gl = new GL(canvas);
    this.canvas = canvas;
    this.init();
  }

  async init() {
    const vertex_shader_source = await fetch('shaders/vertex.glsl').then((res) => res.text());
    const fragment_shader_source = await fetch('shaders/fragment.glsl').then((res) => res.text());

    const fragment_shader = this.gl.create_fragment_shader(fragment_shader_source);
    const vertex_shader = this.gl.create_vertex_shader(vertex_shader_source);
    const shader_program = this.gl.create_shader_program(vertex_shader, fragment_shader);

    this.gl.set_shader_program(shader_program);

    const quad = this.gl.create_quad(-5, -3, 10, 6);
    const mesh = this.gl.create_mesh([quad]);
    this.gl.add_object_to_scene(mesh);

    this.gl.set_camera_position(-0.5, 0, 0);

    this.mouse_position = new Vector(0, 0, 0, 1);

    this.zoom_target = new Vector(0, 0, 0, 1);
    this.zoom_speed = 0;
    this.zoom_level = 1;

    this.desired_julia = 0;
    this.current_julia = -1;

    this.color_cycle = 0;

    this.extreme_mode = false;

    this.drag_active = false;
    this.drag_point = new Vector(0, 0, 0, 1);
    this.drag_camera_start = new Vector(0, 0, 0, 1);

    this.scene_dirty = false;

    // Add keyboard event listener
    window.addEventListener('keypress', (event) => {
      switch (event.key) {
        case 'z':
          this.desired_julia = (this.desired_julia + 1) % 10;
          event.preventDefault();
          break;
        case 'x':
          this.extreme_mode = !this.extreme_mode;
          event.preventDefault();
          break;
        case 'c':
          this.zoom_target = this.mouse_position;
          if (this.zoom_speed > 0) {
            this.zoom_speed += 1;
          } else {
            this.zoom_speed = 1;
          }
          event.preventDefault();
          break;
        case 'v':
          this.zoom_target = this.mouse_position;
          if (this.zoom_speed > 0) {
            this.zoom_speed = -1;
          } else {
            this.zoom_speed -= 1;
          }
          event.preventDefault();
          break;
        default:
          break;
      }
    });

    // Add click listeners
    this.canvas.addEventListener('mousedown', (event) => {
      this.drag_active = true;

      this.drag_camera_start = this.gl.camera_position;

      this.drag_point = this.gl.unproject(
        event.layerX,
        this.canvas.clientHeight - event.layerY,
        0
      );
    });

    this.canvas.addEventListener('mouseup', () => {
      this.drag_active = false;
    });

    this.canvas.addEventListener('mousemove', (event) => {
      // Unproject mouse coords into scene coords.
      this.mouse_position = this.gl.unproject(event.layerX, this.canvas.clientHeight - event.layerY, 0.5);

      // Only move if the mouse is down.
      if (!this.drag_active) {
        return;
      }

      // Stop any zooming going on.
      this.zoom_speed = 0;

      // Set the camera position to: current pos - mouse pos + initial click pos
      this.gl.set_camera_position(
        this.drag_camera_start.x + this.drag_point.x - this.mouse_position.x,
        this.drag_camera_start.y + this.drag_point.y - this.mouse_position.y,
        0
      );
    });

    // Add mouse wheel listener
    this.canvas.addEventListener('wheel', (event) => {
      // No zooming while dragging.
      if (this.drag_active) {
        return;
      }

      // Unproject mouse coords into scene coords.
      this.mouse_position = this.gl.unproject(event.layerX, this.canvas.clientHeight - event.layerY, 0.5);

      this.zoom_target = this.gl.view_matrix.inverse().multiply_vector(this.mouse_position);
      if (event.deltaY > 0) {
        if (this.zoom_speed > 0) {
          this.zoom_speed += 1;
        } else {
          this.zoom_speed = 1;
        }
      } else {
        if (this.zoom_speed > 0) {
          this.zoom_speed = -1;
        } else {
          this.zoom_speed -= 1;
        }
      }
    });

    this.gl.add_render_hook((frame_delta) => this.zoom(frame_delta));
    this.gl.add_render_hook((frame_delta) => this.cycle(frame_delta));
    this.gl.add_render_hook(() => this.switch());
    this.gl.add_render_hook(() => this.drag_active);

    this.gl.event_loop();
  }

  /**
   * Perform zoom calculations.
   *
   * @param {integer} frame_delta
   */
  zoom(frame_delta) {
    if (this.zoom_speed === 0) {
      return false;
    }

    // Find the vector from the current camera position to the zoom target.
    // Scale by the frame_delta so that the movement would occur in 1 / zoom_speed seconds.
    const movement_vector = new Vector(
      this.zoom_target.x - this.gl.camera_position.x,
      this.zoom_target.y - this.gl.camera_position.y,
      0,
      0
    ).multiply(frame_delta * Math.abs(this.zoom_speed) / 1000);

    // Update the camera position along the movement vector.
    this.gl.translate_camera_position(
      movement_vector.x,
      movement_vector.y,
      0,
    );

    // Scale the projection matrix for the zoom effect.
    if ((this.zoom_level < 30000 && this.zoom_speed < 0)
      || (this.zoom_level > 1 && this.zoom_speed > 0)) {
      const scale_factor = 1 + (frame_delta * -this.zoom_speed / 1000);
      this.gl.projection_matrix = this.gl.projection_matrix.scale(
        scale_factor,
        scale_factor,
        1
      );

      this.zoom_level *= scale_factor;
    }

    // Reduce the zoom speed over time.
    this.zoom_speed *= 1 - (frame_delta / 1000);
    if (Math.abs(this.zoom_speed) < 0.005) {
      this.zoom_speed = 0;
    }

    return true;
  }

  /**
   * Cycle the color rotation float.
   *
   * @param {integer} frame_delta
   */
  cycle(frame_delta) {
    let speed = 200;
    if (this.extreme_mode) {
      speed = 10;
    }
    this.color_cycle = (this.color_cycle + frame_delta / speed) % 1024.0;

    this.gl.get_shader_program().set_uniform_float(
      'continuous_cycle',
      this.color_cycle
    );

    return true;
  }

  /**
   * Switch the rendered set.
   */
  switch() {
    if (this.current_julia === this.desired_julia) {
      return false;
    }

    this.current_julia = this.desired_julia;

    let c;
    switch (this.current_julia) {
      case 0:
        c = new Vector(0, 0, 0, 0);
        break;
      case 1:
        c = new Vector(-0.4, 0.6, 0, 0);
        break;
      case 2:
        c = new Vector(0.285, 0, 0, 0);
        break;
      case 3:
        c = new Vector(0.285, 0.01, 0, 0);
        break;
      case 4:
        c = new Vector(0.45, 0.1428, 0, 0);
        break;
      case 5:
        c = new Vector(-0.70176, -0.3842, 0, 0);
        break;
      case 6:
        c = new Vector(-0.835, -0.2321, 0, 0);
        break;
      case 7:
        c = new Vector(-0.8, 0.156, 0, 0);
        break;
      case 8:
        c = new Vector(-0.7269, 0.1889, 0, 0);
        break;
      case 9:
      default:
        c = new Vector(0, -0.8, 0, 0);
        break;
    }

    this.gl.get_shader_program().set_uniform_vec2('julia_constant', c);

    return true;
  }
}
