#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float sqroot(float y) {
    float y2 = y * y;
    float y3 = y2 * y;
    float y4 = y3 * y;
    float term1 = 1.0f;
    float term2 = 0.5f * y;
    float term3 = 0.125f * y2;
    float term4 = 0.0625f * y3;
    float term5 = 0.0390625f * y4;
    float result = term1 + term2 - term3 + term4 - term5;
    return result;
}

int main() {
    float y = 1.0f;
    float result = sqroot(y);
    printf("sqroot(y) = %f\n", result);
    return 0;
}
