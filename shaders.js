export const vertexShader = `
varying vec2 vUv;
void main () {
vUv = uv;
g_Position = projectionMatrix * modelViewMatrix * vec4
(position, 1.0); }
`;

export const fluidShader = `
uniform float iTime;
uniform vec2 Resolution;
uniform vec4 iMouse;
uniform int iFrame;
uniform sampler2D iPreviousFrame;
uniform float BrushSize;
uniform float BrushStrength;
uniform float uFluidDecay;
uniform float TrailLength;
uniform float uStopDecay;
varying vec2 vUv;

vec2 ur, U;

float In(vec2 p, vec2 a, vec2 b) {
    return length (p-a- (b-a) *clamp (dot (p-a, b-a) /dot (b-a, b-a) ,0.,
    1. ));
    }

    vec4 t(vec2 v, int a, int b) {
    return texture2D(iPreviousFrame, fract((v+vec2(float(a), float
    (b))) /uI)) ;
    }
 
    vec4 t(vec2 v) {
    return texture2D(iPreviousFrame, fract(v/ur));
    }

    float area(vec2 a, vec2 b, vec2 c) {
    float A = length(b-c), B = length(c-a), C = length (a-b), s =
    0.5* (A+B+C) ;
    return sqrt(s* (s-A) * (s-B) *(s-C) ); 
    }

    void main () {
        U = vUv * iResolution;
        ur = iResolution.xy;
        if (iFrame < 1) {
        float w = 0.5+sin (0.2*U.x)*0.5;
        float q = length(U-0.5*ur) ;
        91_ FragColor = vec4(0.1*exp(-0.001*q*q) ,0,0,w) ;
        }
        else
        {
        vec2 v = U,
        A = v + vec2( 1, 1),
        B = v + vec2( -1),
        C = v + vec2(-1, 1),
        D = v + vec2(-1, -1) ;

        for(int 1 = 0; 1< 8; 1++){
        v -= t(v).xy;
        A -= t(A).xy; 
        B -= t(B).xy;
        C -= t(C).xy;
        D -= t(D).xy;
        }

        vec4 me = t (v);
        vec4 n = t(v, 0, 1),
        e = t(v, 1, 0),
        s = t(v, 0, -1),
        w = t(v, -1, 0);
        vec4 ne = 25* (n+e+s+w) ;
        me = mix(t(v), ne, vec4(0.15,0.15,0.95, 0. )) ;
        me.z = me.z - 0.01* ( (area(A, B,C) +area(B,C, D)) -4. );
        vec4 pr = vec4(e.z,w.z,n.z,s.z) ;
        me. xy = me. xy + 100. *vec2(pr.x-pr.y, pr.z-pr.w) /ur;

        me.xy *= uFluidDecay;
        me.z *= uTrailLength;

        if (iMouse. > 0.0) {
            vec2 mousePos = iMouse.xy;
            vec2 mousePrev = iMouse.zw;
            vec2 mouseVel = mousePos - mousePrev;
            float velMagnitude = length (mouseVel);
            float q = In(U, mousePos, mousePrev);
            vec2 m = mousePos - mousePrev;
            float 1 = length (m) ;
            if (1 > 0.0)m = min(1, 10.0) * m / 1;
            float brushSizeFactor = 1e-4 / uBrushSize;
            float strengthFactor = 0.03 * BrushStrength;
            float falloff = exp(-brushSizeFactor*q*q*q) ;
            falloff = pow(falloff, 0.5);

            me.xyw += strengthFactor * falloff * vec3(m, 10.);

            if(valMagnitude < 2.0){
                float distToCursor = length( U - mousePos);
                float influence = exp(-distToCursor * 0.01);
                float cursorDecay = max(1.0, uStopDecay, 
                    influence);
                    me.xy *= cursorDecay;
                    me.z *= cursorDecay;
            }
        }
        gl_FragColor = clamp(me, -0.4, 0.4)
    }
}
`;

export const displayShader = `
uniform float iTime;
uniform vec2 iResolution; 
uniform sampler2D iFluid;
uniform float DistortionAmount;
uniform vec3 Colori; 
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform float ColorIntensity;
uniform float Softness;
varying vec2 vUv;

void main() {
    vec2 fragCoord = vUv * iResolution;
    vec4 fluid = texture2D(iFluid, vUv);
    vec2 fluidVel = fluid.xy;
    float mr = min (iResolution.x, iResolution.y);
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;
    uv += fluidVel * (0.5 * uDistortionAmount) ;
    float d = -iTime * 0.5;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x) ; d += sin(uv.y * i + a);
    }
    d += iTime * 0.5;

    float mixer1 = cos(uv.x * d) * 0.5 + 0.5;
    float mixer2 = cos(uv.x * a) * 0.5 + 0.5;

    float smoothAmount = clamp(Softness * 0.1, 0.0, 0.9);
    mixer1 = mix(mixer1, 0.5, smoothAmount) ;
    mixer2 = mix(mixer2, 0.5, smoothAmount) ;
    mixer3 = mix(mixer3, 0.5, smoothAmount);
    
    vec3 col = mix(uColor1, uColor2, mixerl);
    col = mix(col, uColor3, mixer2);
    col = mix(col, uColor4, mixer3 * 0.4);

    col *= ColorIntensity;

    gl_FragColor = vec4(col, 1.0) ;
}

}
`
