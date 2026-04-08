#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#endif

#include <math.h>
#include <stdio.h>

FPC_CALCULATE_ERROR float hypot32(float x1, float x2) {
    float x1_sq = x1 * x1;
    float x2_sq = x2 * x2;
    float sum = x1_sq + x2_sq;
    float r = sqrtf(sum);
    return r;
}

int main() {
    float x1 = 100.0f;
    float x2 = 100.0f;
    float result = hypot32(x1, x2);
    printf("hypot32(x1, x2) = %f\n", result);
    return 0;
}
