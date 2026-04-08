#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float kepler2(float x1, float x2, float x3, float x4, float x5, float x6) {
    float neg_x1 = -x1;
    float neg_x2 = -x2;
    float neg_x3 = -x3;
    float neg_x4 = -x4;
    float neg_x5 = -x5;
    float neg_x6 = -x6;

    float sum1 = neg_x1 + x2;
    float sum2 = sum1 + x3;
    float sum3 = sum2 + neg_x4;
    float sum4 = sum3 + x5;
    float sum5 = sum4 + x6;
    float prod1 = x1 * x4;
    float term1 = prod1 * sum5;

    float sum6 = x1 + neg_x2;
    float sum7 = sum6 + x3;
    float sum8 = sum7 + x4;
    float sum9 = sum8 + neg_x5;
    float sum10 = sum9 + x6;
    float prod2 = x2 * x5;
    float term2 = prod2 * sum10;

    float sum11 = x1 + x2;
    float sum12 = sum11 + neg_x3;
    float sum13 = sum12 + x4;
    float sum14 = sum13 + x5;
    float sum15 = sum14 + neg_x6;
    float prod3 = x3 * x6;
    float term3 = prod3 * sum15;

    float prod4 = x2 * x3;
    float term4 = prod4 * x4;
    float prod5 = x1 * x3;
    float term5 = prod5 * x5;
    float prod6 = x1 * x2;
    float term6 = prod6 * x6;
    float prod7 = x4 * x5;
    float term7 = prod7 * x6;

    float result1 = term1 + term2;
    float result2 = result1 + term3;
    float result3 = result2 - term4;
    float result4 = result3 - term5;
    float result5 = result4 - term6;
    float result = result5 - term7;
    return result;
}

int main() {
    float x1 = 6.36f;
    float x2 = 6.36f;
    float x3 = 6.36f;
    float x4 = 6.36f;
    float x5 = 6.36f;
    float x6 = 6.36f;
    float result = kepler2(x1, x2, x3, x4, x5, x6);
    printf("kepler2(x1, x2, x3, x4, x5, x6) = %f\n", result);
    return 0;
}
