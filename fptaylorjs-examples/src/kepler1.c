#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float kepler1(float x1, float x2, float x3, float x4, float x5, float x6) {
    float neg_x1 = -x1;
    float neg_x2 = -x2;
    float neg_x3 = -x3;
    float neg_x4 = -x4;

    float sum1 = neg_x1 + x2;
    float sum2 = sum1 + x3;
    float sum3 = sum2 + neg_x4;
    float prod1 = x1 * x4;
    float term1 = prod1 * sum3;

    float sum4 = x1 + neg_x2;
    float sum5 = sum4 + x3;
    float sum6 = sum5 + x4;
    float term2 = x2 * sum6;

    float sum7 = x1 + x2;
    float sum8 = sum7 + neg_x3;
    float sum9 = sum8 + x4;
    float term3 = x3 * sum9;

    float prod2 = x2 * x3;
    float term4 = prod2 * x4;
    float term5 = x1 * x3;
    float term6 = x1 * x2;

    float result1 = term1 + term2;
    float result2 = result1 + term3;
    float result3 = result2 - term4;
    float result4 = result3 - term5;
    float result5 = result4 - term6;
    float result = result5 - x4;
    return result;
}

int main() {
    float x1 = 6.36f;
    float x2 = 4.0f;
    float x3 = 4.0f;
    float x4 = 6.36f;
    float x5 = 4.0f;
    float x6 = 4.0f;
    float result = kepler1(x1, x2, x3, x4, x5, x6);
    printf("kepler1(x1, x2, x3, x4, x5, x6) = %f\n", result);
    return 0;
}
