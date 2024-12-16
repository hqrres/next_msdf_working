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
  
  vec3 customPosition = vec3(position);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(customPosition, 1.);

  vec3 lightDirection = vec3( modelViewMatrix * vec4(position, 1.0));
  vec3 worldLightPos = vec3( viewMatrix * vec4(u_lightPos, 1.0));
  v_lightDirection = normalize(worldLightPos - lightDirection);


  v_uv = uv;
  v_normal = normal;
}
`;

