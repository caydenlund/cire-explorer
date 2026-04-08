#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float rigidBody1(float x1, float x2, float x3) {
    float prod1 = x1 * x2;
    float neg_prod1 = -prod1;
    float prod2 = x2 * x3;
    float temp1 = 2.0f * prod2;
    float neg_temp1 = -temp1;
    float neg_x1 = -x1;
    float neg_x3 = -x3;
    float sum1 = neg_prod1 + neg_temp1;
    float sum2 = sum1 + neg_x1;
    float r1 = sum2 + neg_x3;
    return r1;
}

int main() {
    float x1 = -15.0f;
    float x2 = 15.0f;
    float x3 = -15.0f;
    float result = rigidBody1(x1, x2, x3);
    printf("rigidBody1(x1, x2, x3) = %f\n", result);
    return 0;
}
