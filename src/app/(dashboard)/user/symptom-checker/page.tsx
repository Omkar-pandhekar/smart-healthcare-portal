"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import {
  Stethoscope,
  Brain,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const SymptomAnalysisResult = ({ result }: { result: string }) => {
  // Parse the response into sections
  const parseResponse = (text: string) => {
    console.log("Raw AI Response:", text); // Debug log

    const sections: Record<string, string> = {};

    // More flexible regex patterns to handle different formats
    const possibleCausesMatch = text.match(
      /\*\*Possible causes?\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i
    );
    const adviceMatch = text.match(/\*\*Advice\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i);
    const homeCareMatch = text.match(
      /\*\*Home care tips?\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i
    );
    const disclaimerMatch = text.match(
      /\*\*Disclaimer\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i
    );

    console.log("Matches found:", {
      possibleCausesMatch,
      adviceMatch,
      homeCareMatch,
      disclaimerMatch,
    }); // Debug log

    if (possibleCausesMatch)
      sections.possibleCauses = possibleCausesMatch[1].trim();
    if (adviceMatch) sections.advice = adviceMatch[1].trim();
    if (homeCareMatch) sections.homeCare = homeCareMatch[1].trim();
    if (disclaimerMatch) sections.disclaimer = disclaimerMatch[1].trim();

    // If no sections were parsed, try alternative patterns
    if (Object.keys(sections).length === 0) {
      console.log("No sections found, trying alternative parsing..."); // Debug log

      // Try to split by common patterns
      const lines = text.split("\n");
      let currentSection = "";
      let currentContent = "";

      for (const line of lines) {
        if (
          line.includes("**Possible causes**") ||
          line.includes("**Possible cause**")
        ) {
          if (currentSection && currentContent) {
            sections[currentSection] = currentContent.trim();
          }
          currentSection = "possibleCauses";
          currentContent = "";
        } else if (line.includes("**Advice**")) {
          if (currentSection && currentContent) {
            sections[currentSection] = currentContent.trim();
          }
          currentSection = "advice";
          currentContent = "";
        } else if (
          line.includes("**Home care tips**") ||
          line.includes("**Home care tip**")
        ) {
          if (currentSection && currentContent) {
            sections[currentSection] = currentContent.trim();
          }
          currentSection = "homeCare";
          currentContent = "";
        } else if (line.includes("**Disclaimer**")) {
          if (currentSection && currentContent) {
            sections[currentSection] = currentContent.trim();
          }
          currentSection = "disclaimer";
          currentContent = "";
        } else if (currentSection && line.trim()) {
          currentContent += line + "\n";
        }
      }

      // Add the last section
      if (currentSection && currentContent) {
        sections[currentSection] = currentContent.trim();
      }
    }

    console.log("Final sections:", sections); // Debug log
    return sections;
  };

  const sections = parseResponse(result);

  return (
    <div className="space-y-6">
      {sections.possibleCauses && (
        <Card className="shadow border bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-600 dark:text-blue-400">
              <Brain className="w-5 h-5" />
              Possible Causes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-zinc-700 dark:text-zinc-300">
              <ReactMarkdown>{sections.possibleCauses}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {sections.advice && (
        <Card className="shadow border bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
              Medical Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-zinc-700 dark:text-zinc-300">
              <ReactMarkdown>{sections.advice}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {sections.homeCare && (
        <Card className="shadow border bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              Home Care Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-zinc-700 dark:text-zinc-300">
              <ReactMarkdown>{sections.homeCare}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {sections.disclaimer && (
        <Card className="shadow border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-red-700 dark:text-red-300">
              <ReactMarkdown>{sections.disclaimer}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback: If no sections were parsed, show the original response */}
      {Object.keys(sections).length === 0 && (
        <Card className="shadow border bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-zinc-800 dark:text-zinc-200">
              <Brain className="w-5 h-5 text-blue-500" />
              AI Analysis Results
            </CardTitle>
            <CardDescription>
              Based on the symptoms you provided
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SymptomCheckerPage = () => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError("Please enter your symptoms.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.reply) {
          setResult(data.reply);
        } else {
          setError("No response received from AI.");
        }
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const commonSymptoms = [
    "Fever",
    "Headache",
    "Cough",
    "Cold",
    "Fatigue",
    "Nausea",
    "Dizziness",
    "Chest Pain",
    "Shortness of Breath",
  ];

  const symptomBadgeColors: Record<string, string> = {
    Fever:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800",
    Headache:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800",
    Cough:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800",
    Cold: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-800",
    Fatigue:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800",
    Nausea:
      "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-800",
    Dizziness:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-800",
    "Chest Pain":
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800",
    "Shortness of Breath":
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800",
  };

  const handleSymptomClick = (symptom: string) => {
    if (symptoms) {
      setSymptoms(symptoms + ", " + symptom.toLowerCase());
    } else {
      setSymptoms(symptom.toLowerCase());
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                <Brain className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              AI Symptom Checker
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
              Get instant AI-powered analysis of your symptoms. This tool
              provides preliminary insights and recommendations, but always
              consult a healthcare professional for proper diagnosis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2">
              <Card className="shadow border bg-white dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Stethoscope className="w-5 h-5 text-blue-500" />
                    Describe Your Symptoms
                  </CardTitle>
                  <CardDescription>
                    Enter your symptoms in detail for better analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Symptoms
                      </label>
                      <Textarea
                        className="min-h-[120px] resize-none border focus:border-zinc-500 focus:ring-zinc-500/20 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        required
                        placeholder="Describe your symptoms in detail... (e.g., fever for 2 days, severe headache, dry cough)"
                      />
                    </div>

                    {/* Common Symptoms */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Quick Add Common Symptoms:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {commonSymptoms.map((symptom) => (
                          <Badge
                            key={symptom}
                            variant="outline"
                            className={cn(
                              "cursor-pointer border transition-colors flex items-center gap-1",
                              symptomBadgeColors[symptom] ||
                                "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
                            )}
                            onClick={() => handleSymptomClick(symptom)}
                          >
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-3 text-lg font-semibold shadow transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-200 dark:text-blue-300" />
                          Analyzing Symptoms...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2 text-blue-200 dark:text-blue-300" />
                          Check Symptoms
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <Card className="shadow border bg-white dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-200">
                        1
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 pt-0.5">
                        Enter your symptoms in detail
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-200">
                        2
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 pt-0.5">
                        AI analyzes your symptoms
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-200">
                        3
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 pt-0.5">
                        Get preliminary insights and recommendations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow border bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Important Notice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    This AI symptom checker provides preliminary analysis only.
                    It is not a substitute for professional medical advice,
                    diagnosis, or treatment. Always consult with a qualified
                    healthcare provider for proper medical care.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="mt-8">
              <SymptomAnalysisResult result={result} />
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="mt-8">
              <Card className="shadow border bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;
