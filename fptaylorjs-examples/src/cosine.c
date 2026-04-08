#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float cosine(float x) {
    float x2 = x * x;
    float x4 = x2 * x2;
    float x6 = x4 * x2;
    float term1 = 1.0f;
    float term2 = x2 / 2.0f;
    float term3 = x4 / 24.0f;
    float term4 = x6 / 720.0f;
    float result = term1 - term2 + term3 - term4;
    return result;
}

int main() {
    float x = 0.0f;
    float result = cosine(x);
    printf("cosine(x) = %f\n", result);
    return 0;
}
