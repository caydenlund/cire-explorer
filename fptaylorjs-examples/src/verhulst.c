#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float verhulst(float x) {
    float r = 4.0f;
    float K = 1.11f;
    float numerator = r * x;
    float x_div_K = x / K;
    float denominator = 1.0f + x_div_K;
    float res = numerator / denominator;
    return res;
}

int main() {
    float x = 0.30000000000000004f;
    float result = verhulst(x);
    printf("verhulst(x) = %f\n", result);
    return 0;
}
