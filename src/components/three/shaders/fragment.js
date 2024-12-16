export const fragmentShader = `precision mediump float;
uniform sampler2D u_texture;
uniform float u_time;
uniform vec3 u_spotLightColor;
uniform float u_lightIntensity;


varying vec2 v_uv;
varying vec3 v_lightDirection;
varying vec3 v_normal;


vec3 light_reflection(vec3 lightColor) {
  vec3 color = lightColor;
  
  vec3 diffuse = lightColor * dot(v_lightDirection, v_normal);
  
  return (color + diffuse);
}

void main() {
  float speed = u_time * 0.5;
  vec2 repeat = vec2(7., 5.);

  vec2 uv = fract(v_uv * repeat + vec2(1., speed));

  vec3 light_value = light_reflection(u_spotLightColor);
  light_value *= u_lightIntensity;

  vec3 texture = texture2D(u_texture, uv).rgb * light_value;
  vec3 colorMask = texture2D(u_texture, uv).rgb;

  gl_FragColor = vec4(texture, colorMask.r);
}
`;
