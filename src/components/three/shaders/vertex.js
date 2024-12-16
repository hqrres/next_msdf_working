export const vertexShader = `
// Variable qualifiers that come with the msdf shader

attribute vec2 uv;
attribute vec3 position;
attribute vec3 normal;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 viewMatrix;
uniform vec3 u_lightPos;

varying vec2 v_uv;
varying vec3 v_lightDirection;
varying vec3 v_normal;

float smootherstep(float edge0, float edge1, float x) {
  // Scale, bias and saturate x to 0..1 range
  x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  // Evaluate polynomial
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

void main() {
  vec3 customPosition = position;

  // Apply twist effect around the x-axis
  float angle = position.x * 0.0; // Adjust the multiplier for more or less twist
  float s = sin(angle);
  float c = cos(angle);

  // Rotate around the x-axis
  customPosition.y = position.y * c - position.z * s;
  customPosition.z = position.y * s + position.z * c;

  // Smooth scaling effect with smootherstep
  float scaleFactor = smootherstep(0.0, 25.0, position.x) * 4.0 + 1.0; // Scale from 1x to 5x
  customPosition *= scaleFactor;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(customPosition, 1.);

  vec3 lightDirection = vec3(modelViewMatrix * vec4(position, 1.0));
  vec3 worldLightPos = vec3(viewMatrix * vec4(u_lightPos, 1.0));
  v_lightDirection = normalize(worldLightPos - lightDirection);

  v_uv = uv;
  v_normal = normal;
}
`;

