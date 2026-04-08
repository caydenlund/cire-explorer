; ModuleID = 'src/kepler1.c'
source_filename = "src/kepler1.c"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"
target triple = "x86_64-unknown-linux-gnu"

@.str = private unnamed_addr constant [38 x i8] c"kepler1(x1, x2, x3, x4, x5, x6) = %f\0A\00", align 1

; Function Attrs: mustprogress nofree norecurse nosync nounwind willreturn memory(none) uwtable
define dso_local float @kepler1(float noundef %x1, float noundef %x2, float noundef %x3, float noundef %x4, float noundef %x5, float noundef %x6) local_unnamed_addr #0 {
entry:
  %add = fsub float %x2, %x1
  %add4 = fadd float %add, %x3
  %add5 = fsub float %add4, %x4
  %mul = fmul float %x1, %x4
  %mul6 = fmul float %mul, %add5
  %add7 = fsub float %x1, %x2
  %add8 = fadd float %add7, %x3
  %add9 = fadd float %add8, %x4
  %mul10 = fmul float %add9, %x2
  %add11 = fadd float %x1, %x2
  %add12 = fsub float %add11, %x3
  %add13 = fadd float %add12, %x4
  %mul14 = fmul float %add13, %x3
  %mul15 = fmul float %x2, %x3
  %mul16 = fmul float %mul15, %x4
  %mul17 = fmul float %x1, %x3
  %mul18 = fmul float %x1, %x2
  %add19 = fadd float %mul6, %mul10
  %add20 = fadd float %mul14, %add19
  %sub = fsub float %add20, %mul16
  %sub21 = fsub float %sub, %mul17
  %sub22 = fsub float %sub21, %mul18
  %sub23 = fsub float %sub22, %x4
  ret float %sub23
}

; Function Attrs: nofree nounwind uwtable
define dso_local noundef i32 @main() local_unnamed_addr #1 {
entry:
  %call1 = tail call i32 (ptr, ...) @printf(ptr noundef nonnull dereferenceable(1) @.str, double noundef 0xC06F053020000000)
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
