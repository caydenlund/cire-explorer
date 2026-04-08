; ModuleID = 'src/hartman3.c'
source_filename = "src/hartman3.c"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"
target triple = "x86_64-unknown-linux-gnu"

@.str = private unnamed_addr constant [27 x i8] c"hartman3(x1, x2, x3) = %f\0A\00", align 1

; Function Attrs: mustprogress nofree nounwind willreturn memory(write) uwtable
define dso_local float @hartman3(float noundef %x1, float noundef %x2, float noundef %x3) local_unnamed_addr #0 {
entry:
  %sub = fadd float %x1, 0xBFD79C0EC0000000
  %sub1 = fadd float %x2, 0xBFBDF3B640000000
  %sub2 = fadd float %x3, 0xBFD11B7180000000
  %mul = fmul float %sub, %sub
  %mul3 = fmul float %sub1, %sub1
  %mul4 = fmul float %sub2, %sub2
  %mul5 = fmul float %mul, 3.000000e+00
  %mul6 = fmul float %mul3, 1.000000e+01
  %mul7 = fmul float %mul4, 3.000000e+01
  %add = fadd float %mul5, %mul6
  %add8 = fadd float %add, %mul7
  %sub9 = fadd float %x1, 0xBFDE12D780000000
  %sub10 = fadd float %x2, 0xBFDC13A920000000
  %sub11 = fadd float %x3, 0xBFE7E76C80000000
  %mul12 = fmul float %sub9, %sub9
  %mul13 = fmul float %sub10, %sub10
  %mul14 = fmul float %sub11, %sub11
  %mul15 = fmul float %mul12, 0x3FB99999A0000000
  %mul16 = fmul float %mul13, 1.000000e+01
  %mul17 = fmul float %mul14, 3.500000e+01
  %add18 = fadd float %mul15, %mul16
  %add19 = fadd float %add18, %mul17
  %sub20 = fadd float %x1, 0xBFBBEDFA40000000
  %sub21 = fadd float %x2, 0xBFEBF14120000000
  %sub22 = fadd float %x3, 0xBFE1C01A40000000
  %mul23 = fmul float %sub20, %sub20
  %mul24 = fmul float %sub21, %sub21
  %mul25 = fmul float %sub22, %sub22
  %mul26 = fmul float %mul23, 3.000000e+00
  %mul27 = fmul float %mul24, 1.000000e+01
  %mul28 = fmul float %mul25, 3.000000e+01
  %add29 = fadd float %mul26, %mul27
  %add30 = fadd float %add29, %mul28
  %sub31 = fadd float %x1, 0xBFA38865A0000000
  %sub32 = fadd float %x2, 0xBFE260AA60000000
  %sub33 = fadd float %x3, 0xBFEC3FE5C0000000
  %mul34 = fmul float %sub31, %sub31
  %mul35 = fmul float %sub32, %sub32
  %mul36 = fmul float %sub33, %sub33
  %mul37 = fmul float %mul34, 0x3FB99999A0000000
  %mul38 = fmul float %mul35, 1.000000e+01
  %mul39 = fmul float %mul36, 3.500000e+01
  %add40 = fadd float %mul37, %mul38
  %add41 = fadd float %add40, %mul39
  %fneg = fneg float %add8
  %fneg42 = fneg float %add19
  %fneg43 = fneg float %add30
  %fneg44 = fneg float %add41
  %call = tail call float @expf(float noundef %fneg) #4, !tbaa !5
  %call45 = tail call float @expf(float noundef %fneg42) #4, !tbaa !5
  %call46 = tail call float @expf(float noundef %fneg43) #4, !tbaa !5
  %call47 = tail call float @expf(float noundef %fneg44) #4, !tbaa !5
  %mul49 = fmul float %call45, 0x3FF3333340000000
  %mul50 = fmul float %call46, 3.000000e+00
  %mul51 = fmul float %call47, 0x40099999A0000000
  %add52 = fadd float %call, %mul49
  %add53 = fadd float %add52, %mul50
  %add54 = fadd float %add53, %mul51
  %fneg55 = fneg float %add54
  ret float %fneg55
}

; Function Attrs: mustprogress nofree nounwind willreturn memory(write)
declare float @expf(float noundef) local_unnamed_addr #1

; Function Attrs: nofree nounwind uwtable
define dso_local noundef i32 @main() local_unnamed_addr #2 {
entry:
  %call1 = tail call i32 (ptr, ...) @printf(ptr noundef nonnull dereferenceable(1) @.str, double noundef 0xBFB166C040000000)
  ret i32 0
}

; Function Attrs: nofree nounwind
declare noundef i32 @printf(ptr nocapture noundef readonly, ...) local_unnamed_addr #3

attributes #0 = { mustprogress nofree nounwind willreturn memory(write) uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #1 = { mustprogress nofree nounwind willreturn memory(write) "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #2 = { nofree nounwind uwtable "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #3 = { nofree nounwind "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }
attributes #4 = { nounwind }

!llvm.module.flags = !{!0, !1, !2, !3}
!llvm.ident = !{!4}

!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 8, !"PIC Level", i32 2}
!2 = !{i32 7, !"PIE Level", i32 2}
!3 = !{i32 7, !"uwtable", i32 2}
!4 = !{!"clang version 19.1.7"}
!5 = !{!6, !6, i64 0}
!6 = !{!"int", !7, i64 0}
!7 = !{!"omnipotent char", !8, i64 0}
!8 = !{!"Simple C/C++ TBAA"}
