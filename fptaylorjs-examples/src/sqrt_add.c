#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#endif

#include <math.h>
#include <stdio.h>

FPC_CALCULATE_ERROR float sqrt_add(float x) {
    float x_plus_1 = x + 1.0f;
    float sqrt1 = sqrtf(x_plus_1);
    float sqrt2 = sqrtf(x);
    float sum = sqrt1 + sqrt2;
    float r = 1.0f / sum;
    return r;
}

int main() {
    float x = 1.0f;
    float result = sqrt_add(x);
    printf("sqrt_add(x) = %f\n", result);
    return 0;
}
