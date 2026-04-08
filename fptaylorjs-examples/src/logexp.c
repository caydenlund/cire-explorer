#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#endif

#include <math.h>
#include <stdio.h>

FPC_CALCULATE_ERROR float logexp(float x) {
    float f = x;
    float e = expf(f);
    float t = 1 + e;
    float r = logf(t);
    return r;
}

int main() {
    float x = 8.0f;
    float result = logexp(x);
    printf("logexp(x) = %f\n", result);
    return 0;
}
