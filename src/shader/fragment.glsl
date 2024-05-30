#version 300 es
precision highp float;
out vec4 outColor;
in vec2 tc; // texture coordinate of pixel (interpolated)
in vec3 fn; // fragment normal of pixel (interpolated)

void main() {
  outColor = vec4(tc.x, tc.y, 0.0, 1.0);
}