#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float r(float x) {
    return x + x;
}

int main() {
    float x = 20.0f;
    float result = r(x);
    printf("r(x) = %f\n", result);
    return 0;
}
