#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float turbine3(float v, float w, float r) {
    float r_sq = r * r;
    float term1 = 2.0f / r_sq;
    float temp1 = 2.0f * v;
    float temp2 = 1.0f + temp1;
    float w_sq = w * w;
    float temp3 = w_sq * r_sq;
    float temp4 = temp2 * temp3;
    float temp5 = 1.0f - v;
    float temp6 = temp4 / temp5;
    float term2 = 0.125f * temp6;
    float sum1 = 3.0f - term1;
    float sum2 = sum1 - term2;
    float r3 = sum2 - 0.5f;
    return r3;
}

int main() {
    float v = -4.5f;
    float w = 0.9f;
    float r = 7.800000000000001f;
    float result = turbine3(v, w, r);
    printf("turbine3(v, w, r) = %f\n", result);
    return 0;
}
