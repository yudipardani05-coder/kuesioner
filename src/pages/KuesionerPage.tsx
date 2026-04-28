import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { questions, scaleLabels, groupInfo } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Building2,
  Clock,
  BookOpen,
  Scale,
  BarChart3,
  TrendingUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const groupIcons = {
  X1: <Scale className="w-5 h-5" />,
  X2: <BarChart3 className="w-5 h-5" />,
  Y: <TrendingUp className="w-5 h-5" />,
};

export default function KuesionerPage() {
  const [personalData, setPersonalData] = useState({
    name: "",
    department: "",
    workDuration: "",
  });

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    X1: true,
    X2: false,
    Y: false,
  });

  const submitMutation = trpc.kuesioner.submit.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setPersonalData({ name: "", department: "", workDuration: "" });
      setAnswers({});
    },
  });

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleAnswer = useCallback((questionNumber: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [String(questionNumber)]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`q${questionNumber}`];
      return next;
    });
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!personalData.name.trim()) newErrors.name = "Nama lengkap wajib diisi";
    if (!personalData.department.trim()) newErrors.department = "Bagian wajib diisi";
    if (!personalData.workDuration.trim()) newErrors.workDuration = "Lama bekerja wajib diisi";

    questions.forEach((q) => {
      if (answers[String(q.number)] === undefined) {
        newErrors[`q${q.number}`] = "Pilih jawaban";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [personalData, answers]);

  const handleSubmit = useCallback(() => {
    if (!validate()) {
      // Scroll to first error
      const firstError = document.querySelector("[data-error='true']");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    submitMutation.mutate({
      name: personalData.name,
      department: personalData.department,
      workDuration: personalData.workDuration,
      answers,
    });
  }, [validate, submitMutation, personalData, answers]);

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, typeof questions> = { X1: [], X2: [], Y: [] };
    questions.forEach((q) => {
      groups[q.group].push(q);
    });
    return groups;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <ClipboardList className="w-7 h-7" />
            </div>
            <span className="text-blue-200 text-sm font-medium tracking-wide uppercase">
              Penelitian Skripsi
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
            Kuesioner Penelitian
          </h1>
          <p className="text-blue-100 text-base md:text-lg max-w-2xl leading-relaxed">
            Kuesioner ini bertujuan untuk mengumpulkan data penelitian. Isilah data diri Anda dengan lengkap dan benar, lalu jawablah setiap pernyataan sesuai pengalaman dan persepsi Anda.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-blue-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Tidak ada jawaban benar atau salah
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Kerahasiaan dijamin
            </span>
          </div>
        </div>
      </header>

      {/* Scale Legend */}
      <div className="max-w-5xl mx-auto px-4 -mt-5">
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span className="font-semibold text-amber-800 text-sm">Keterangan Skala Penilaian</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {scaleLabels.map((scale) => (
                <div
                  key={scale.value}
                  className="flex flex-col items-center text-center p-2.5 rounded-lg bg-white/70 border border-amber-100"
                >
                  <span className={`w-8 h-8 ${scale.color} rounded-full flex items-center justify-center text-white text-xs font-bold mb-1.5`}>
                    {scale.value}
                  </span>
                  <span className="font-bold text-gray-800 text-xs">{scale.label}</span>
                  <span className="text-[10px] text-gray-500 leading-tight mt-0.5">{scale.full}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Personal Data Card */}
        <Card className="shadow-lg border-0 overflow-hidden" data-error={errors.name || errors.department || errors.workDuration ? "true" : undefined}>
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              A. Data Responden
            </h2>
          </div>
          <CardContent className="p-6 space-y-5">
            <div className="grid md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={personalData.name}
                  onChange={(e) => {
                    setPersonalData((p) => ({ ...p, name: e.target.value }));
                    setErrors((prev) => { const n = { ...prev }; delete n.name; return n; });
                  }}
                  placeholder="Masukkan nama lengkap"
                  className={`h-11 ${errors.name ? "border-red-400 ring-1 ring-red-200" : ""}`}
                />
                {errors.name && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-gray-700 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  Bagian <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="department"
                  value={personalData.department}
                  onChange={(e) => {
                    setPersonalData((p) => ({ ...p, department: e.target.value }));
                    setErrors((prev) => { const n = { ...prev }; delete n.department; return n; });
                  }}
                  placeholder="Masukkan bagian/unit kerja"
                  className={`h-11 ${errors.department ? "border-red-400 ring-1 ring-red-200" : ""}`}
                />
                {errors.department && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.department}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="workDuration" className="text-gray-700 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Lama Bekerja <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="workDuration"
                  value={personalData.workDuration}
                  onChange={(e) => {
                    setPersonalData((p) => ({ ...p, workDuration: e.target.value }));
                    setErrors((prev) => { const n = { ...prev }; delete n.workDuration; return n; });
                  }}
                  placeholder="Contoh: 2 Tahun"
                  className={`h-11 ${errors.workDuration ? "border-red-400 ring-1 ring-red-200" : ""}`}
                />
                {errors.workDuration && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.workDuration}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="sticky top-4 z-30 bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Progress Pengisian
            </span>
            <span className="text-sm font-bold text-blue-600">
              {answeredCount}/{totalQuestions} soal ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
          {progressPercent === 100 && (
            <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Semua pertanyaan telah dijawab!
            </p>
          )}
        </div>

        {/* Question Groups */}
        {(Object.keys(groupedQuestions) as Array<keyof typeof groupInfo>).map((groupKey) => {
          const info = groupInfo[groupKey];
          const groupQs = groupedQuestions[groupKey];
          const groupAnswered = groupQs.filter((q) => answers[String(q.number)] !== undefined).length;
          const isExpanded = expandedGroups[groupKey];

          return (
            <Card key={groupKey} className={`shadow-lg border-0 overflow-hidden ${info.bgColor}`}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className={`w-full ${info.headerBg} px-5 py-4 flex items-center justify-between text-white transition-all hover:opacity-95`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg">{groupIcons[groupKey]}</div>
                  <div className="text-left">
                    <h3 className="font-bold text-base md:text-lg">{info.title}</h3>
                    <p className="text-white/80 text-xs md:text-sm">{info.subtitle} &middot; {groupAnswered}/{groupQs.length} dijawab</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {isExpanded && (
                <CardContent className="p-0">
                  <div className="px-5 py-3 bg-white/50 border-b border-gray-100">
                    <p className="text-sm text-gray-600 italic">{info.description}</p>
                  </div>

                  {/* Table Header (desktop) */}
                  <div className="hidden md:grid grid-cols-[60px_1fr_repeat(5,70px)] gap-2 px-5 py-2.5 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600">
                    <span>No</span>
                    <span>Pernyataan</span>
                    {scaleLabels.map((s) => (
                      <span key={s.value} className="text-center">{s.label}</span>
                    ))}
                  </div>

                  <div className="divide-y divide-gray-100">
                    {groupQs.map((q) => {
                      const selected = answers[String(q.number)];
                      const hasError = errors[`q${q.number}`];

                      return (
                        <div
                          key={q.number}
                          data-error={hasError ? "true" : undefined}
                          className={`px-4 md:px-5 py-4 transition-colors ${
                            hasError ? "bg-red-50/50" : selected ? "bg-emerald-50/30" : "hover:bg-gray-50/50"
                          }`}
                        >
                          {/* Mobile: stacked layout */}
                          <div className="md:hidden">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold shrink-0 mt-0.5">
                                {q.number}
                              </span>
                              <p className="text-sm text-gray-800 leading-relaxed">{q.text}</p>
                            </div>
                            <p className="text-[10px] text-gray-400 mb-3 ml-9">
                              Dimensi: {q.dimension} &middot; Indikator: {q.indicator}
                            </p>
                            <div className="grid grid-cols-5 gap-1.5 ml-9">
                              {scaleLabels.map((scale) => (
                                <button
                                  key={scale.value}
                                  onClick={() => handleAnswer(q.number, scale.value)}
                                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                                    selected === scale.value
                                      ? `${scale.color} border-transparent text-white shadow-md scale-105`
                                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                  }`}
                                >
                                  <span className={`text-lg font-bold ${selected === scale.value ? "text-white" : "text-gray-700"}`}>
                                    {scale.value}
                                  </span>
                                  <span className={`text-[9px] mt-0.5 ${selected === scale.value ? "text-white/90" : "text-gray-500"}`}>
                                    {scale.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                            {hasError && (
                              <p className="text-red-500 text-xs mt-1.5 ml-9 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{hasError}
                              </p>
                            )}
                          </div>

                          {/* Desktop: table row layout */}
                          <div className="hidden md:grid grid-cols-[60px_1fr_repeat(5,70px)] gap-2 items-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold">
                              {q.number}
                            </span>
                            <div>
                              <p className="text-sm text-gray-800 leading-relaxed">{q.text}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {q.dimension} &middot; {q.indicator}
                              </p>
                            </div>
                            {scaleLabels.map((scale) => (
                              <button
                                key={scale.value}
                                onClick={() => handleAnswer(q.number, scale.value)}
                                className={`flex flex-col items-center py-2.5 px-1 rounded-lg border-2 transition-all ${
                                  selected === scale.value
                                    ? `${scale.color} border-transparent text-white shadow-md scale-105`
                                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                }`}
                                title={scale.full}
                              >
                                <span className={`text-sm font-bold ${selected === scale.value ? "text-white" : "text-gray-700"}`}>
                                  {scale.value}
                                </span>
                                <span className={`text-[9px] mt-0.5 ${selected === scale.value ? "text-white/90" : "text-gray-500"}`}>
                                  {scale.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Submit Section */}
        <div className="sticky bottom-4 z-30">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-md">
            <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600">
                  {progressPercent === 100
                    ? "Semua pertanyaan telah dijawab. Siap dikirim!"
                    : `Anda telah menjawab ${answeredCount} dari ${totalQuestions} pertanyaan.`}
                </p>
                {Object.keys(errors).length > 0 && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 justify-center md:justify-start">
                    <AlertCircle className="w-3 h-3" />
                    Masih ada {Object.keys(errors).length} field yang belum valid
                  </p>
                )}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                size="lg"
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Kirim Kuesioner
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {submitMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Terjadi kesalahan</p>
              <p className="text-sm text-red-600">{submitMutation.error?.message}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 text-gray-400 text-sm">
          <p>Kuesioner Penelitian Skripsi &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">Data dijaga kerahasiaannya dan digunakan untuk kepentingan penelitian</p>
        </footer>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Terima Kasih!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Kuesioner Anda berhasil dikirim. Data telah tersimpan dan file Excel telah dikirim ke email peneliti.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 rounded-lg p-4 mt-2 space-y-2 text-sm">
            <p className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Data responden tersimpan di database
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              File Excel siap olah SPSS/SmartPLS
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Email notifikasi telah dikirim
            </p>
          </div>
          <Button
            onClick={() => {
              setShowSuccess(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            Isi Kuesioner Lagi
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
