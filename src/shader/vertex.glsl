#version 300 es
precision highp float;
in vec3 position; // input vertex position from mesh
in vec2 texcoord; // input vertex texture coordinate from mesh
in vec3 normal;   // input vertex normal from mesh

out vec2 tc; // output texture coordinate of vertex
out vec3 fn; // output fragment normal of vertex

void main() {
  tc = texcoord;
  fn = normal;
  gl_Position = vec4(0.5 * position, 1.0);
}