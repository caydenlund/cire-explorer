#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float kepler0(float x1, float x2, float x3, float x4, float x5, float x6) {
    float term1 = x2 * x5;
    float term2 = x3 * x6;
    float term3 = x2 * x3;
    float term4 = x5 * x6;
    float neg_x1 = -x1;
    float neg_x4 = -x4;
    float sum1 = neg_x1 + x2;
    float sum2 = sum1 + x3;
    float sum3 = sum2 + neg_x4;
    float sum4 = sum3 + x5;
    float sum5 = sum4 + x6;
    float term5 = x1 * sum5;
    float result1 = term1 + term2;
    float result2 = result1 - term3;
    float result3 = result2 - term4;
    float result = result3 + term5;
    return result;
}

int main() {
    float x1 = 6.36f;
    float x2 = 6.36f;
    float x3 = 6.36f;
    float x4 = 4.0f;
    float x5 = 6.36f;
    float x6 = 6.36f;
    float result = kepler0(x1, x2, x3, x4, x5, x6);
    printf("kepler0(x1, x2, x3, x4, x5, x6) = %f\n", result);
    return 0;
}
