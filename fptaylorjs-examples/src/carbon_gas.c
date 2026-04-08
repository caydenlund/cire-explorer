#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float carbon_gas(float T, float a, float b, float N, float p, float V) {
    float k = 1.3806503e-23f;
    float N_div_V = N / V;
    float N_div_V_sq = N_div_V * N_div_V;
    float temp1 = a * N_div_V_sq;
    float term1 = p + temp1;
    float temp2 = N * b;
    float term2 = V - temp2;
    float prod = term1 * term2;
    float temp3 = k * N;
    float temp4 = temp3 * T;
    float res = prod - temp4;
    return res;
}

int main() {
    float T = 300.0f;
    float a = 0.401f;
    float b = 4.27e-05f;
    float N = 1000.0f;
    float p = 35000000.0f;
    float V = 0.49999999999999994f;
    float result = carbon_gas(T, a, b, N, p, V);
    printf("carbon_gas(T, a, b, N, p, V) = %f\n", result);
    return 0;
}
