; ModuleID = 'src/kepler2.c'
source_filename = "src/kepler2.c"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"
target triple = "x86_64-unknown-linux-gnu"

@.str = private unnamed_addr constant [38 x i8] c"kepler2(x1, x2, x3, x4, x5, x6) = %f\0A\00", align 1

; Function Attrs: mustprogress nofree norecurse nosync nounwind willreturn memory(none) uwtable
define dso_local float @kepler2(float noundef %x1, float noundef %x2, float noundef %x3, float noundef %x4, float noundef %x5, float noundef %x6) local_unnamed_addr #0 {
entry:
  %add = fsub float %x2, %x1
  %add6 = fadd float %add, %x3
  %add7 = fsub float %add6, %x4
  %add8 = fadd float %add7, %x5
  %add9 = fadd float %add8, %x6
  %mul = fmul float %x1, %x4
  %mul10 = fmul float %mul, %add9
  %add11 = fsub float %x1, %x2
  %add12 = fadd float %add11, %x3
  %add13 = fadd float %add12, %x4
  %add14 = fsub float %add13, %x5
  %add15 = fadd float %add14, %x6
  %mul16 = fmul float %x2, %x5
  %mul17 = fmul float %mul16, %add15
  %add18 = fadd float %x1, %x2
  %add19 = fsub float %add18, %x3
  %add20 = fadd float %add19, %x4
  %add21 = fadd float %add20, %x5
  %add22 = fsub float %add21, %x6
  %mul23 = fmul float %x3, %x6
  %mul24 = fmul float %mul23, %add22
  %mul25 = fmul float %x2, %x3
  %mul26 = fmul float %mul25, %x4
  %mul27 = fmul float %x1, %x3
  %mul28 = fmul float %mul27, %x5
  %mul29 = fmul float %x1, %x2
  %mul30 = fmul float %mul29, %x6
  %mul31 = fmul float %x4, %x5
  %mul32 = fmul float %mul31, %x6
  %add33 = fadd float %mul10, %mul17
  %add34 = fadd float %mul24, %add33
  %sub = fsub float %add34, %mul26
  %sub35 = fsub float %sub, %mul28
  %sub36 = fsub float %sub35, %mul30
  %sub37 = fsub float %sub36, %mul32
  ret float %sub37
}

; Function Attrs: nofree nounwind uwtable
define dso_local noundef i32 @main() local_unnamed_addr #1 {
entry:
  %call1 = tail call i32 (ptr, ...) @printf(ptr noundef nonnull dereferenceable(1) @.str, double noundef 0x4080142640000000)
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
