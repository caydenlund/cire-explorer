#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float sine(float x) {
    float x2 = x * x;
    float x3 = x2 * x;
    float x5 = x3 * x2;
    float x7 = x5 * x2;
    float term1 = x;
    float term2 = x3 / 6.0f;
    float term3 = x5 / 120.0f;
    float term4 = x7 / 5040.0f;
    float result = term1 - term2 + term3 - term4;
    return result;
}

int main() {
    float x = 1.57079632679f;
    float result = sine(x);
    printf("sine(x) = %f\n", result);
    return 0;
}
