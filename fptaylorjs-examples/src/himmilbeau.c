#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float himmilbeau(float x1, float x2) {
    float x1_sq = x1 * x1;
    float x2_sq = x2 * x2;
    float term1 = x1_sq + x2;
    float term2 = term1 - 11.0f;
    float sq1 = term2 * term2;
    float term3 = x1 + x2_sq;
    float term4 = term3 - 7.0f;
    float sq2 = term4 * term4;
    float result = sq1 + sq2;
    return result;
}

int main() {
    float x1 = 5.0f;
    float x2 = 5.0f;
    float result = himmilbeau(x1, x2);
    printf("himmilbeau(x1, x2) = %f\n", result);
    return 0;
}
