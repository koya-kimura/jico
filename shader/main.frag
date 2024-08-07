precision mediump float;

varying vec2 vTexCoord;

uniform float u_time;
uniform sampler2D u_tex;

float PI=3.14159265358979;

float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main(void){
    vec2 uv=vTexCoord;
    
    vec4 col=texture2D(u_tex,uv);

    if(col.r<.1&&col.g>.99&&col.b<.1){
        col.rgb=vec3(pow(random(uv), 20.0));
    }else{
        float dev = 5.0;
        float g = (col.r + col.g + col.b) / 3.0;
        float newG = floor(fract(pow(g+random(uv)*0.1+0.2, 2.0)) * dev) / dev;
        col.rgb = vec3(newG);
    }

    gl_FragColor=col;
}