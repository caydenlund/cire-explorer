#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float predatorPrey(float x) {
    float r = 4.0f;
    float K = 1.11f;
    float x_sq = x * x;
    float numerator = r * x_sq;
    float x_div_K = x / K;
    float x_div_K_sq = x_div_K * x_div_K;
    float denominator = 1.0f + x_div_K_sq;
    float res = numerator / denominator;
    return res;
}

int main() {
    float x = 0.30000000000000004f;
    float result = predatorPrey(x);
    printf("predatorPrey(x) = %f\n", result);
    return 0;
}
