#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float doppler3(float u, float v, float T) {
    float temp1 = 0.6f * T;
    float t1 = 331.4f + temp1;
    float neg_t1 = -t1;
    float numerator = neg_t1 * v;
    float t1_plus_u = t1 + u;
    float denominator = t1_plus_u * t1_plus_u;
    float r = numerator / denominator;
    return r;
}

int main() {
    float u = -30.0f;
    float v = 20300.0f;
    float T = -50.0f;
    float result = doppler3(u, v, T);
    printf("doppler3(u, v, T) = %f\n", result);
    return 0;
}
