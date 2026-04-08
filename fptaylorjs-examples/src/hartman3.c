#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#endif

#include <math.h>
#include <stdio.h>

FPC_CALCULATE_ERROR float hartman3(float x1, float x2, float x3) {
    float diff1_1 = x1 - 0.3689f;
    float diff1_2 = x2 - 0.117f;
    float diff1_3 = x3 - 0.2673f;
    float sq1_1 = diff1_1 * diff1_1;
    float sq1_2 = diff1_2 * diff1_2;
    float sq1_3 = diff1_3 * diff1_3;
    float term1_1 = 3.0f * sq1_1;
    float term1_2 = 10.0f * sq1_2;
    float term1_3 = 30.0f * sq1_3;
    float e1 = term1_1 + term1_2 + term1_3;

    float diff2_1 = x1 - 0.4699f;
    float diff2_2 = x2 - 0.4387f;
    float diff2_3 = x3 - 0.747f;
    float sq2_1 = diff2_1 * diff2_1;
    float sq2_2 = diff2_2 * diff2_2;
    float sq2_3 = diff2_3 * diff2_3;
    float term2_1 = 0.1f * sq2_1;
    float term2_2 = 10.0f * sq2_2;
    float term2_3 = 35.0f * sq2_3;
    float e2 = term2_1 + term2_2 + term2_3;

    float diff3_1 = x1 - 0.1091f;
    float diff3_2 = x2 - 0.8732f;
    float diff3_3 = x3 - 0.5547f;
    float sq3_1 = diff3_1 * diff3_1;
    float sq3_2 = diff3_2 * diff3_2;
    float sq3_3 = diff3_3 * diff3_3;
    float term3_1 = 3.0f * sq3_1;
    float term3_2 = 10.0f * sq3_2;
    float term3_3 = 30.0f * sq3_3;
    float e3 = term3_1 + term3_2 + term3_3;

    float diff4_1 = x1 - 0.03815f;
    float diff4_2 = x2 - 0.5743f;
    float diff4_3 = x3 - 0.8828f;
    float sq4_1 = diff4_1 * diff4_1;
    float sq4_2 = diff4_2 * diff4_2;
    float sq4_3 = diff4_3 * diff4_3;
    float term4_1 = 0.1f * sq4_1;
    float term4_2 = 10.0f * sq4_2;
    float term4_3 = 35.0f * sq4_3;
    float e4 = term4_1 + term4_2 + term4_3;

    float neg_e1 = -e1;
    float neg_e2 = -e2;
    float neg_e3 = -e3;
    float neg_e4 = -e4;
    float exp1 = expf(neg_e1);
    float exp2 = expf(neg_e2);
    float exp3 = expf(neg_e3);
    float exp4 = expf(neg_e4);

    float scaled_exp1 = 1.0f * exp1;
    float scaled_exp2 = 1.2f * exp2;
    float scaled_exp3 = 3.0f * exp3;
    float scaled_exp4 = 3.2f * exp4;
    float sum = scaled_exp1 + scaled_exp2 + scaled_exp3 + scaled_exp4;
    float result = -sum;
    return result;
}

int main() {
    // No inputs specified, using default values
    float x1 = 0.0f;
    float x2 = 0.0f;
    float x3 = 0.0f;
    float result = hartman3(x1, x2, x3);
    printf("hartman3(x1, x2, x3) = %f\n", result);
    return 0;
}
