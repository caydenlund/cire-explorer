#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float turbine2(float v, float w, float r) {
    float term1 = 6.0f * v;
    float w_sq = w * w;
    float r_sq = r * r;
    float temp1 = w_sq * r_sq;
    float temp2 = v * temp1;
    float temp3 = 1.0f - v;
    float temp4 = temp2 / temp3;
    float term2 = 0.5f * temp4;
    float sum1 = term1 - term2;
    float r2 = sum1 - 2.5f;
    return r2;
}

int main() {
    float v = -4.5f;
    float w = 0.9f;
    float r = 7.800000000000001f;
    float result = turbine2(v, w, r);
    printf("turbine2(v, w, r) = %f\n", result);
    return 0;
}
