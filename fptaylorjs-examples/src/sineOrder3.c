#ifndef FPC_CALCULATE_ERROR
#define FPC_CALCULATE_ERROR
#include <stdio.h>
#endif

FPC_CALCULATE_ERROR float sineOrder3(float z) {
    float z2 = z * z;
    float z3 = z2 * z;
    float term1 = 0.954929658551372f * z;
    float term2 = 0.12900613773279798f * z3;
    float result = term1 - term2;
    return result;
}

int main() {
    float z = 2.0f;
    float result = sineOrder3(z);
    printf("sineOrder3(z) = %f\n", result);
    return 0;
}
