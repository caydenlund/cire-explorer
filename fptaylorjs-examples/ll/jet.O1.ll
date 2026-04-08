; ModuleID = 'src/jet.c'
source_filename = "src/jet.c"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"
target triple = "x86_64-unknown-linux-gnu"

@.str = private unnamed_addr constant [18 x i8] c"jet(x1, x2) = %f\0A\00", align 1

; Function Attrs: mustprogress nofree norecurse nosync nounwind willreturn memory(none) uwtable
define dso_local float @jet(float noundef %x1, float noundef %x2) local_unnamed_addr #0 {
entry:
  %mul = fmul float %x1, %x1
  %mul1 = fmul float %mul, %x1
  %mul2 = fmul float %mul, 3.000000e+00
  %mul3 = fmul float %x2, 2.000000e+00
  %add = fadd float %mul2, %mul3
  %sub = fsub float %add, %x1
  %add4 = fadd float %mul, 1.000000e+00
  %div = fdiv float %sub, %add4
  %mul5 = fmul float %x1, 2.000000e+00
  %mul6 = fmul float %mul5, %div
  %sub7 = fadd float %div, -3.000000e+00
  %mul8 = fmul float %mul6, %sub7
  %mul9 = fmul float %div, 4.000000e+00
  %sub10 = fadd float %mul9, -6.000000e+00
  %mul11 = fmul float %mul, %sub10
  %add12 = fadd float %mul8, %mul11
  %mul13 = fmul float %add4, %add12
  %mul15 = fmul float %mul2, %div
  %mul21 = fmul float %div, 3.000000e+00
  %add22 = fadd float %mul15, %mul13
  %add23 = fadd float %mul1, %add22
  %add24 = fadd float %add23, %x1
  %add25 = fadd float %mul21, %add24
  %add26 = fadd float %add25, %x1
  ret float %add26
}

; Function Attrs: nofree nounwind uwtable
define dso_local noundef i32 @main() local_unnamed_addr #1 {
entry:
  %call1 = tail call i32 (ptr, ...) @printf(ptr noundef nonnull dereferenceable(1) @.str, double noundef 0x40B1B889E0000000)
  ret i32 0
}

; Function Attrs: nofree nounwind
declare noundef i32 @printf(ptr nocapture noundef readonly, ...) local_unnamed_addr #2

attributes #0 = { mustprogress nofree norecurse nosync nounwind willreturn memory(none) uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #1 = { nofree nounwind uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #2 = { nofree nounwind "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }

!llvm.module.flags = !{!0, !1, !2, !3}
!llvm.ident = !{!4}

!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 8, !"PIC Level", i32 2}
!2 = !{i32 7, !"PIE Level", i32 2}
!3 = !{i32 7, !"uwtable", i32 2}
!4 = !{!"clang version 19.1.7"}
