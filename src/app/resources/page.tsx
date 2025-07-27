"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Shield,
  Phone,
  Users,
  Headphones,
  Brain,
  Activity,
  ArrowRight,
  AlertCircle,
  Wind,
  Pill,
  Sun,
  BookOpen,
  Lightbulb,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react";

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState("breathing");

  const tabs = [
    { id: "breathing", name: "Breathing Exercises", icon: Wind },
    { id: "meditation", name: "Meditation", icon: Sun },
    { id: "medication", name: "Medications", icon: Pill },
    { id: "coping", name: "Coping Strategies", icon: Lightbulb },
    { id: "education", name: "Education", icon: BookOpen },
  ];

  const breathingExercises = [
    {
      title: "4-7-8 Breathing Technique",
      description:
        "A simple but powerful breathing exercise for relaxation and sleep",
      steps: [
        "Sit or lie down in a comfortable position",
        "Place your tongue against the roof of your mouth",
        "Close your mouth and inhale through your nose for 4 counts",
        "Hold your breath for 7 counts",
        "Exhale through your mouth for 8 counts",
        "Repeat 4 times, gradually increasing to 8 cycles",
      ],
      benefits: [
        "Reduces anxiety",
        "Improves sleep",
        "Lowers blood pressure",
        "Calms the nervous system",
      ],
      duration: "5-10 minutes",
      difficulty: "Beginner",
    },
    {
      title: "Box Breathing (Square Breathing)",
      description: "A technique used by Navy SEALs to maintain calm and focus",
      steps: [
        "Sit with your back straight and feet flat on the floor",
        "Inhale through your nose for 4 counts",
        "Hold your breath for 4 counts",
        "Exhale through your nose for 4 counts",
        "Hold your breath for 4 counts",
        "Repeat for 5-10 minutes",
      ],
      benefits: [
        "Reduces stress",
        "Improves concentration",
        "Balances nervous system",
        "Increases focus",
      ],
      duration: "5-10 minutes",
      difficulty: "Beginner",
    },
    {
      title: "Diaphragmatic Breathing",
      description:
        "Deep breathing that engages the diaphragm for maximum oxygen intake",
      steps: [
        "Lie on your back with knees bent and feet flat",
        "Place one hand on your chest, the other on your stomach",
        "Breathe in through your nose, letting your stomach rise",
        "Keep your chest still as your stomach expands",
        "Exhale slowly through pursed lips",
        "Practice for 5-10 minutes daily",
      ],
      benefits: [
        "Reduces stress hormones",
        "Improves lung function",
        "Lowers heart rate",
        "Enhances relaxation",
      ],
      duration: "5-10 minutes",
      difficulty: "Beginner",
    },
  ];

  const meditationPractices = [
    {
      title: "Mindfulness Meditation",
      description: "Focus on the present moment without judgment",
      instructions:
        "Sit comfortably, close your eyes, and focus on your breath. When your mind wanders, gently bring it back to your breath. Start with 5 minutes and gradually increase.",
      benefits: [
        "Reduces stress and anxiety",
        "Improves focus and concentration",
        "Enhances emotional regulation",
        "Increases self-awareness",
      ],
      duration: "5-20 minutes",
      tips: [
        "Start with short sessions",
        "Be patient with yourself",
        "Practice regularly",
        "Find a quiet space",
      ],
    },
    {
      title: "Loving-Kindness Meditation",
      description: "Cultivate compassion for yourself and others",
      instructions:
        "Sit comfortably and silently repeat phrases like 'May I be happy, may I be healthy, may I be at peace.' Then extend these wishes to others.",
      benefits: [
        "Increases compassion",
        "Reduces negative emotions",
        "Improves relationships",
        "Enhances well-being",
      ],
      duration: "10-20 minutes",
      tips: [
        "Start with yourself",
        "Be genuine in your wishes",
        "Practice regularly",
        "Extend to difficult people gradually",
      ],
    },
    {
      title: "Body Scan Meditation",
      description:
        "Systematically focus attention on different parts of the body",
      instructions:
        "Lie down and mentally scan your body from head to toe, noticing sensations without trying to change them.",
      benefits: [
        "Reduces physical tension",
        "Improves body awareness",
        "Helps with pain management",
        "Promotes relaxation",
      ],
      duration: "10-30 minutes",
      tips: [
        "Find a comfortable position",
        "Move slowly through each body part",
        "Don't judge sensations",
        "Practice regularly",
      ],
    },
  ];

  const medicationInfo = [
    {
      category: "Antidepressants",
      description:
        "Medications that help treat depression and anxiety disorders",
      types: [
        {
          name: "SSRIs (Selective Serotonin Reuptake Inhibitors)",
          examples: [
            "Fluoxetine (Prozac)",
            "Sertraline (Zoloft)",
            "Escitalopram (Lexapro)",
          ],
          uses: ["Depression", "Anxiety disorders", "OCD", "PTSD"],
          sideEffects: [
            "Nausea",
            "Insomnia",
            "Sexual dysfunction",
            "Weight changes",
          ],
          notes:
            "Most commonly prescribed antidepressants, generally well-tolerated",
        },
        {
          name: "SNRIs (Serotonin-Norepinephrine Reuptake Inhibitors)",
          examples: ["Venlafaxine (Effexor)", "Duloxetine (Cymbalta)"],
          uses: ["Depression", "Anxiety", "Chronic pain", "Fibromyalgia"],
          sideEffects: [
            "Nausea",
            "Dizziness",
            "Sweating",
            "Blood pressure changes",
          ],
          notes: "May be more effective for depression with physical symptoms",
        },
      ],
      importantNotes: [
        "Take exactly as prescribed",
        "Don't stop suddenly without doctor guidance",
        "May take 4-6 weeks to see full effects",
        "Regular monitoring may be required",
      ],
    },
    {
      category: "Anti-Anxiety Medications",
      description: "Medications that help reduce anxiety and panic symptoms",
      types: [
        {
          name: "Benzodiazepines",
          examples: [
            "Alprazolam (Xanax)",
            "Lorazepam (Ativan)",
            "Diazepam (Valium)",
          ],
          uses: ["Short-term anxiety relief", "Panic attacks", "Insomnia"],
          sideEffects: [
            "Drowsiness",
            "Dependency risk",
            "Memory problems",
            "Coordination issues",
          ],
          notes: "Generally for short-term use due to dependency risk",
        },
        {
          name: "Buspirone",
          examples: ["Buspirone (Buspar)"],
          uses: [
            "Generalized anxiety disorder",
            "Long-term anxiety management",
          ],
          sideEffects: ["Dizziness", "Nausea", "Headache", "Nervousness"],
          notes: "Non-addictive alternative to benzodiazepines",
        },
      ],
      importantNotes: [
        "Benzodiazepines can be habit-forming",
        "Don't mix with alcohol",
        "May cause drowsiness - avoid driving",
        "Gradual tapering required when stopping",
      ],
    },
  ];

  const copingStrategies = [
    {
      title: "Grounding Techniques",
      description: "Methods to bring yourself back to the present moment",
      techniques: [
        {
          name: "5-4-3-2-1 Method",
          steps: [
            "Name 5 things you can see",
            "Name 4 things you can touch",
            "Name 3 things you can hear",
            "Name 2 things you can smell",
            "Name 1 thing you can taste",
          ],
        },
        {
          name: "Progressive Muscle Relaxation",
          steps: [
            "Tense and relax each muscle group",
            "Start from toes and work up",
            "Hold tension for 5 seconds",
            "Release and feel the relaxation",
          ],
        },
      ],
    },
    {
      title: "Cognitive Behavioral Techniques",
      description: "Tools to challenge and change negative thought patterns",
      techniques: [
        {
          name: "Thought Challenging",
          steps: [
            "Identify the negative thought",
            "Ask: Is this thought true?",
            "Look for evidence against it",
            "Replace with a more balanced thought",
          ],
        },
        {
          name: "Behavioral Activation",
          steps: [
            "Schedule pleasant activities",
            "Break tasks into smaller steps",
            "Set achievable goals",
            "Track your mood changes",
          ],
        },
      ],
    },
  ];

  const educationalContent = [
    {
      title: "Understanding Depression",
      content:
        "Depression is more than just feeling sad. It's a serious mental health condition that affects how you feel, think, and behave. Symptoms can include persistent sadness, loss of interest in activities, changes in appetite or sleep, fatigue, and thoughts of death or suicide.",
      symptoms: [
        "Persistent sadness",
        "Loss of interest",
        "Changes in appetite",
        "Sleep problems",
        "Fatigue",
        "Feelings of worthlessness",
      ],
      treatments: [
        "Therapy",
        "Medication",
        "Lifestyle changes",
        "Support groups",
      ],
    },
    {
      title: "Anxiety Disorders",
      content:
        "Anxiety disorders involve excessive fear or worry that interferes with daily life. They can include generalized anxiety disorder, panic disorder, social anxiety disorder, and specific phobias.",
      symptoms: [
        "Excessive worry",
        "Restlessness",
        "Difficulty concentrating",
        "Physical symptoms (racing heart, sweating)",
        "Avoidance behaviors",
      ],
      treatments: [
        "Cognitive behavioral therapy",
        "Medication",
        "Relaxation techniques",
        "Lifestyle modifications",
      ],
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "breathing":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              Breathing Exercises for Mental Health
            </h3>
            {breathingExercises.map((exercise, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wind className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {exercise.title}
                  </h4>
                </div>
                <p className="text-gray-600 mb-4">{exercise.description}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Steps:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      {exercise.steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Benefits:
                    </h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {exercise.benefits.map((benefit, benefitIndex) => (
                        <li
                          key={benefitIndex}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-blue-500" />
                        Duration: {exercise.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3 text-orange-500" />
                        Difficulty: {exercise.difficulty}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "meditation":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              Meditation Practices
            </h3>
            {meditationPractices.map((practice, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sun className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {practice.title}
                  </h4>
                </div>
                <p className="text-gray-600 mb-4">{practice.description}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Instructions:
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      {practice.instructions}
                    </p>
                    <h5 className="font-semibold text-gray-800 mb-2">Tips:</h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {practice.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Benefits:
                    </h5>
                    <ul className="space-y-1 text-sm text-gray-600 mb-4">
                      {practice.benefits.map((benefit, benefitIndex) => (
                        <li
                          key={benefitIndex}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-3 w-3 text-blue-500" />
                      Duration: {practice.duration}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "medication":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              Mental Health Medications
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">
                    Important Disclaimer
                  </h4>
                  <p className="text-sm text-red-700">
                    This information is for educational purposes only. Always
                    consult with a healthcare professional before starting,
                    stopping, or changing any medication. Never self-prescribe
                    or adjust dosages.
                  </p>
                </div>
              </div>
            </div>

            {medicationInfo.map((category, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Pill className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {category.category}
                  </h4>
                </div>
                <p className="text-gray-600 mb-4">{category.description}</p>

                {category.types.map((type, typeIndex) => (
                  <div
                    key={typeIndex}
                    className="mb-6 p-4 bg-gray-50 rounded-lg"
                  >
                    <h5 className="font-semibold text-gray-800 mb-2">
                      {type.name}
                    </h5>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h6 className="font-medium text-gray-700 mb-1">
                          Examples:
                        </h6>
                        <ul className="text-gray-600">
                          {type.examples.map((example, exIndex) => (
                            <li key={exIndex}>• {example}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-700 mb-1">
                          Uses:
                        </h6>
                        <ul className="text-gray-600">
                          {type.uses.map((use, useIndex) => (
                            <li key={useIndex}>• {use}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h6 className="font-medium text-gray-700 mb-1">
                        Common Side Effects:
                      </h6>
                      <p className="text-sm text-gray-600">
                        {type.sideEffects.join(", ")}
                      </p>
                    </div>
                    <div className="mt-3">
                      <h6 className="font-medium text-gray-700 mb-1">Notes:</h6>
                      <p className="text-sm text-gray-600">{type.notes}</p>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">
                    Important Notes:
                  </h5>
                  <ul className="space-y-1 text-sm text-blue-700">
                    {category.importantNotes.map((note, noteIndex) => (
                      <li key={noteIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );

      case "coping":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              Coping Strategies
            </h3>
            {copingStrategies.map((strategy, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {strategy.title}
                  </h4>
                </div>
                <p className="text-gray-600 mb-4">{strategy.description}</p>

                <div className="space-y-4">
                  {strategy.techniques.map((technique, techIndex) => (
                    <div key={techIndex} className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        {technique.name}
                      </h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        {technique.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "education":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              Mental Health Education
            </h3>
            {educationalContent.map((content, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {content.title}
                  </h4>
                </div>
                <p className="text-gray-600 mb-4">{content.content}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Common Symptoms:
                    </h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {content.symptoms.map((symptom, symptomIndex) => (
                        <li
                          key={symptomIndex}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Treatment Options:
                    </h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {content.treatments.map((treatment, treatmentIndex) => (
                        <li
                          key={treatmentIndex}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-3 w-3 text-blue-500" />
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const quickAccess = [
    {
      title: "Crisis Helpline",
      description: "24/7 emergency support",
      icon: Phone,
      color: "text-red-600",
      bgColor: "bg-red-100",
      action: "Call 988",
    },
    {
      title: "Find Therapist",
      description: "Professional help directory",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      action: "Search Now",
    },
    {
      title: "Meditation",
      description: "Guided sessions",
      icon: Headphones,
      color: "text-green-600",
      bgColor: "bg-green-100",
      action: "Start Session",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#2d153c] via-[#e6f2fd] to-[#0bb1e3]">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl w-full flex flex-col items-center relative">
        <Link
          href="/dashboard"
          className="self-start mb-4 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md transition text-center"
        >
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-green-500 mb-4">
          Mental Health Resources
        </h1>
        <p className="text-gray-700 text-center mb-8">
          Access helpful information and support for your mental wellness
          journey
        </p>

        {/* Quick Access Section */}
        <div className="w-full mb-8">
          <h2 className="text-lg font-semibold mb-4 text-green-600">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickAccess.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-green-600 hover:text-green-700">
                    {item.action} →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-4 text-green-600">
            Detailed Information
          </h2>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">{renderTabContent()}</div>
        </div>

        {/* Emergency Notice */}
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mt-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">
                Emergency Support
              </h3>
              <p className="text-sm text-red-700 mb-3">
                If you&apos;re experiencing a mental health crisis, please reach
                out for immediate help. Support is available 24/7.
              </p>
              <div className="flex gap-3">
                <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md transition">
                  Call 988 (Crisis Helpline)
                </button>
                <button className="border border-red-300 text-red-700 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-md transition">
                  Find Local Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
