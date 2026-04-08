#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float rigidBody2(float x1, float x2, float x3) {
    float prod1 = x1 * x2;
    float prod2 = prod1 * x3;
    float term1 = 2.0f * prod2;
    float x3_sq = x3 * x3;
    float term2 = 3.0f * x3_sq;
    float prod3 = x2 * x1;
    float prod4 = prod3 * x2;
    float prod5 = prod4 * x3;
    float neg_prod5 = -prod5;
    float term3 = 3.0f * x3_sq;
    float neg_x2 = -x2;
    float sum1 = term1 + term2;
    float sum2 = sum1 + neg_prod5;
    float sum3 = sum2 + term3;
    float r2 = sum3 + neg_x2;
    return r2;
}

int main() {
    float x1 = -15.0f;
    float x2 = -15.0f;
    float x3 = 15.0f;
    float result = rigidBody2(x1, x2, x3);
    printf("rigidBody2(x1, x2, x3) = %f\n", result);
    return 0;
}
