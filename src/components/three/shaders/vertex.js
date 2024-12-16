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

void main() {
  vec3 customPosition = position;

  // Apply twist effect around the x-axis
  float angle = position.x * 0.0; // Adjust the multiplier for more or less twist
  float s = sin(angle);
  float c = cos(angle);

  // Rotate around the x-axis
  customPosition.y = position.y * c - position.z * s;
  customPosition.z = position.y * s + position.z * c;

  // Custom scaling effect on y and z axes
  float t = clamp((position.x - 3.0) / 50.0, 0.0, 1.0); // Adjust the range for scaling
  float scaleFactor = mix(1.0, 5.0, pow(t, 3.0)); // Custom curve with cubic easing
  customPosition.y *= scaleFactor;
  customPosition.z *= scaleFactor;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(customPosition, 1.);

  vec3 lightDirection = vec3(modelViewMatrix * vec4(position, 1.0));
  vec3 worldLightPos = vec3(viewMatrix * vec4(u_lightPos, 1.0));
  v_lightDirection = normalize(worldLightPos - lightDirection);

  v_uv = uv;
  v_normal = normal;
}
`;

