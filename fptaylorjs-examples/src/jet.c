#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float jet(float x1, float x2) {
    float x1_sq = x1 * x1;
    float x1_cube = x1_sq * x1;
    float temp1 = 3.0f * x1_sq;
    float temp2 = 2.0f * x2;
    float temp3 = temp1 + temp2;
    float t = temp3 - x1;

    float denom = x1_sq + 1.0f;
    float t_div_denom = t / denom;

    float term1 = 2.0f * x1;
    float term2 = term1 * t_div_denom;
    float term3 = t_div_denom - 3.0f;
    float term4 = term2 * term3;

    float term5 = 4.0f * t_div_denom;
    float term6 = term5 - 6.0f;
    float term7 = x1_sq * term6;

    float term8 = term4 + term7;
    float term9 = term8 * denom;

    float term10 = 3.0f * x1_sq;
    float term11 = term10 * t_div_denom;

    float temp4 = 3.0f * x1_sq;
    float temp5 = 2.0f * x2;
    float temp6 = temp4 + temp5;
    float temp7 = temp6 - x1;
    float temp8 = temp7 / denom;
    float term12 = 3.0f * temp8;

    float sum1 = term9 + term11;
    float sum2 = sum1 + x1_cube;
    float sum3 = sum2 + x1;
    float sum4 = sum3 + term12;
    float r = x1 + sum4;
    return r;
}

int main() {
    float x1 = 5.0f;
    float x2 = 5.0f;
    float result = jet(x1, x2);
    printf("jet(x1, x2) = %f\n", result);
    return 0;
}
